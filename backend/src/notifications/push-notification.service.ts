import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';

export interface DeviceTokenRecord {
  token: string;
  deviceName?: string;
  platform?: string;
  updatedAt: string;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private isInitialized = false;
  private app: App | null = null;
  private readonly adminTokens: Map<string, DeviceTokenRecord> = new Map();
  private readonly tokensFilePath = path.resolve(process.cwd(), 'fcm-tokens.json');

  constructor() {
    this.initFirebase();
    this.loadSavedTokens();
  }

  private initFirebase() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
        this.isInitialized = true;
        this.logger.log('Firebase Admin SDK already initialized.');
        return;
      }

      let credential: any = null;

      // 1. Environment variable FIREBASE_SERVICE_ACCOUNT_KEY (JSON string or file path)
      const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (envKey && envKey.trim().length > 0) {
        if (envKey.trim().startsWith('{')) {
          const parsed = JSON.parse(envKey);
          credential = cert(parsed);
        } else if (fs.existsSync(envKey.trim())) {
          const content = fs.readFileSync(envKey.trim(), 'utf-8');
          credential = cert(JSON.parse(content));
        }
      }

      // 2. Direct local file: firebase-service-account.json
      if (!credential) {
        const potentialPaths = [
          path.resolve(process.cwd(), 'firebase-service-account.json'),
          path.resolve(process.cwd(), 'backend', 'firebase-service-account.json'),
        ];
        for (const p of potentialPaths) {
          if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, 'utf-8');
            credential = cert(JSON.parse(content));
            this.logger.log(`Loaded Firebase credentials from ${p}`);
            break;
          }
        }
      }

      // 3. GOOGLE_APPLICATION_CREDENTIALS
      if (!credential && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        credential = applicationDefault();
      }

      if (credential) {
        this.app = initializeApp({ credential });
        this.isInitialized = true;
        this.logger.log('Firebase Cloud Messaging (FCM) Admin SDK initialized successfully.');
      } else {
        this.logger.log(
          'Firebase service account key not yet configured. Operating in graceful mode (notifications buffered). Add FIREBASE_SERVICE_ACCOUNT_KEY to activate live FCM.',
        );
      }
    } catch (err: any) {
      this.logger.warn(`Firebase Admin SDK init failed: ${err.message}. Operating in graceful mode.`);
      this.isInitialized = false;
    }
  }

  private loadSavedTokens() {
    try {
      if (fs.existsSync(this.tokensFilePath)) {
        const data = fs.readFileSync(this.tokensFilePath, 'utf-8');
        const list: DeviceTokenRecord[] = JSON.parse(data);
        for (const it of list) {
          if (it.token) {
            this.adminTokens.set(it.token, it);
          }
        }
        this.logger.log(`Loaded ${this.adminTokens.size} registered FCM device token(s) from disk.`);
      }
    } catch (_) {}
  }

  private persistTokens() {
    try {
      const list = Array.from(this.adminTokens.values());
      fs.writeFileSync(this.tokensFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      this.logger.warn(`Failed to persist FCM tokens to disk: ${e}`);
    }
  }

  registerAdminToken(token: string, metadata?: { deviceName?: string; platform?: string }) {
    if (!token || token.trim().length === 0) return { success: false, error: 'Token is empty' };
    const cleanToken = token.trim();
    this.adminTokens.set(cleanToken, {
      token: cleanToken,
      deviceName: metadata?.deviceName || 'Admin Device',
      platform: metadata?.platform || 'web/mobile',
      updatedAt: new Date().toISOString(),
    });
    this.persistTokens();
    this.logger.log(`FCM token registered. Total active devices: ${this.adminTokens.size}`);
    return { success: true, totalTokens: this.adminTokens.size };
  }

  removeAdminToken(token: string) {
    const clean = token.trim();
    const removed = this.adminTokens.delete(clean);
    if (removed) this.persistTokens();
    return { success: removed, totalTokens: this.adminTokens.size };
  }

  getRegisteredTokens(): string[] {
    return Array.from(this.adminTokens.keys());
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeDeviceTokens: this.adminTokens.size,
      service: 'Firebase Cloud Messaging (FCM)',
      channels: ['sanctum_orders_channel', 'sanctum_products_channel'],
    };
  }

  // ==========================================
  // DISPATCH: SACRED ORDER NOTIFICATION
  // ==========================================
  async sendOrderNotification(order: any) {
    const tokens = this.getRegisteredTokens();
    const devotee = order.devoteeName || order.customer || 'Devotee';
    const itemsCount = Array.isArray(order.items) ? order.items.length : 1;
    const amount = order.totalAmount ?? order.amount ?? 0;
    const orderId = order.id || 'ORD-NEW';

    this.logger.log(
      `[PushNotification] New sacred order #${orderId} from ${devotee} (₹${amount}). Registered FCM targets: ${tokens.length}`,
    );

    if (!this.isInitialized || tokens.length === 0) {
      return { sent: false, reason: !this.isInitialized ? 'FCM_NOT_INITIALIZED' : 'NO_TOKENS_REGISTERED' };
    }

    const message: MulticastMessage = {
      tokens,
      notification: {
        title: '🪔 New Sacred Order Placed!',
        body: `${devotee} ordered ${itemsCount} consecrated ornament(s) • Total: ₹${amount}`,
        imageUrl: 'https://aamadappetti.com/assets/images/brand_logo_gold.png',
      },
      data: {
        type: 'ORDER',
        orderId: String(orderId),
        devoteeName: String(devotee),
        amount: String(amount),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          color: '#D4AF37', // Sanctum Gold
          sound: 'default',
          channelId: 'sanctum_orders_channel',
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'temple_bell.aiff',
            badge: 1,
          },
        },
      },
    };

    try {
      const messaging = getMessaging(this.app || undefined);
      const response = await messaging.sendEachForMulticast(message);
      this.logger.log(`FCM order notification dispatched: ${response.successCount} succeeded, ${response.failureCount} failed.`);
      return { sent: true, successCount: response.successCount, failureCount: response.failureCount };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch FCM order notification: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // ==========================================
  // DISPATCH: PRODUCT CREATED / LOW STOCK ALERT
  // ==========================================
  async sendProductNotification(product: any, isLowStock = false) {
    const tokens = this.getRegisteredTokens();
    const title = isLowStock ? '⚠️ Low Sanctum Stock Alert' : '✨ Sacred Product Consecrated';
    const body = isLowStock
      ? `Only ${product.stock ?? 0} units remaining for "${product.name || 'Ornament'}" in holy inventory.`
      : `"${product.name || 'Panchaloham Ornament'}" has been consecrated and published live.`;

    let imgUrl = 'https://aamadappetti.com/assets/images/brand_logo_gold.png';
    if (product.images && product.images.length > 0 && product.images[0]) {
      const raw = product.images[0];
      imgUrl = raw.startsWith('http') ? raw : `https://aamadappetti.com${raw}`;
    } else if (product.image) {
      imgUrl = product.image.startsWith('http') ? product.image : `https://aamadappetti.com${product.image}`;
    }

    this.logger.log(`[PushNotification] ${title}: ${body}. Registered targets: ${tokens.length}`);

    if (!this.isInitialized || tokens.length === 0) {
      return { sent: false, reason: !this.isInitialized ? 'FCM_NOT_INITIALIZED' : 'NO_TOKENS_REGISTERED' };
    }

    const message: MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
        imageUrl: imgUrl,
      },
      data: {
        type: 'PRODUCT',
        productId: String(product.id || ''),
        isLowStock: String(isLowStock),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          color: '#D4AF37',
          sound: 'default',
          channelId: 'sanctum_products_channel',
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public',
        },
      },
    };

    try {
      const messaging = getMessaging(this.app || undefined);
      const response = await messaging.sendEachForMulticast(message);
      this.logger.log(`FCM product notification dispatched: ${response.successCount} succeeded, ${response.failureCount} failed.`);
      return { sent: true, successCount: response.successCount, failureCount: response.failureCount };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch FCM product notification: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // ==========================================
  // DISPATCH: TEST NOTIFICATION (ADMIN DASHBOARD)
  // ==========================================
  async sendTestNotification(title?: string, body?: string) {
    const tokens = this.getRegisteredTokens();
    const finalTitle = title || '🪔 Sanctum Push Test Notification';
    const finalBody = body || 'Firebase Cloud Messaging is successfully connected to Aamadappetti Admin App.';

    if (!this.isInitialized || tokens.length === 0) {
      return {
        sent: false,
        reason: !this.isInitialized ? 'FCM_NOT_INITIALIZED' : 'NO_TOKENS_REGISTERED',
        message: 'Push not dispatched: either FCM credentials are not configured or 0 device tokens are registered.',
      };
    }

    const message: MulticastMessage = {
      tokens,
      notification: {
        title: finalTitle,
        body: finalBody,
        imageUrl: 'https://aamadappetti.com/assets/images/brand_logo_gold.png',
      },
      data: {
        type: 'TEST',
        timestamp: new Date().toISOString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'sanctum_orders_channel',
          color: '#D4AF37',
          sound: 'default',
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const messaging = getMessaging(this.app || undefined);
      const response = await messaging.sendEachForMulticast(message);
      this.logger.log(`FCM test notification dispatched: ${response.successCount} succeeded, ${response.failureCount} failed.`);

      // Automatically purge stale or expired tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/registration-token-not-registered' ||
            errCode === 'messaging/invalid-registration-token'
          ) {
            this.removeAdminToken(tokens[idx]);
          }
        }
      });

      return { sent: true, successCount: response.successCount, failureCount: response.failureCount };
    } catch (err: any) {
      return { sent: false, error: err.message };
    }
  }
}
