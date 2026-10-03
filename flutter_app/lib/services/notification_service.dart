import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_service.dart';
import '../screens/dashboard_screen.dart';
import '../screens/inquiries_screen.dart';
import '../theme/temple_theme.dart';

/// Top-level background message handler for Firebase Messaging
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
  if (kDebugMode) {
    print('[FCM Background] Handling message: ${message.messageId}');
  }
}

class NotificationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  static const MethodChannel _nativeChannel = MethodChannel('com.aamadappetti.aamadappetti_admin/notifications');
  static bool _isInitialized = false;

  /// Initializes Firebase and FCM push notification listeners.
  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      if (kIsWeb) {
        // Firebase web initialization
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: 'AIzaSyB5QasAj_7UvfrRnqCVArVuLJCYMRzznIs',
            appId: '1:57338864137:web:6320eb28ecfb7f04f74ed8',
            messagingSenderId: '57338864137',
            projectId: 'aamadappetti-sanctum',
            storageBucket: 'aamadappetti-sanctum.firebasestorage.app',
            authDomain: 'aamadappetti-sanctum.firebaseapp.com',
          ),
        );
      } else {
        // Android / iOS native initialization
        await Firebase.initializeApp();
      }

      final messaging = FirebaseMessaging.instance;

      // 1. Request notification permissions (critical for Android 13+ & iOS)
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: true,
        provisional: false,
        sound: true,
      );

      if (kDebugMode) {
        print('[FCM] User granted permission: ${settings.authorizationStatus}');
      }

      // 2. Set background message handler (Native Android / iOS only)
      if (!kIsWeb) {
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      }

      // 3. Retrieve and register device token with backend
      try {
        final token = await messaging.getToken();
        if (token != null && token.isNotEmpty) {
          if (kDebugMode) {
            print('[FCM] Device Token: $token');
          }
          await ApiService.registerFcmToken(
            token,
            deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
            platform: kIsWeb ? 'web' : 'android',
          );
        }
      } catch (err) {
        if (kDebugMode) {
          print('[FCM] Token fetch error: $err');
        }
      }

      // 4. Token refresh listener
      messaging.onTokenRefresh.listen((newToken) {
        ApiService.registerFcmToken(
          newToken,
          deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
          platform: kIsWeb ? 'web' : 'android',
        );
      });

      // 5. FOREGROUND Messages: Display golden Sanctum alert banner AND native Android system tray notification
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('[FCM Foreground] Got message: ${message.notification?.title}');
        }
        _showForegroundNotificationBanner(message);

        // Show native system notification in Android status bar & pull-down shade
        if (!kIsWeb) {
          try {
            final title = message.notification?.title ?? message.data['title'] ?? '🪔 Sacred Notification';
            final body = message.notification?.body ?? message.data['body'] ?? 'New Sanctum alert received.';
            final channelId = message.notification?.android?.channelId ?? 'sanctum_orders_channel';
            _nativeChannel.invokeMethod('showNotification', {
              'title': title,
              'body': body,
              'channelId': channelId,
            });
          } catch (e) {
            if (kDebugMode) {
              print('[Native Notification Error] $e');
            }
          }
        }
      });

      // 6. BACKGROUND Messages: User clicked notification while app was running in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('[FCM onMessageOpenedApp] Clicked notification: ${message.data}');
        }
        handleNotificationClick(message.data);
      });

      // 7. TERMINATED STATE: User clicked notification when app was closed/killed
      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        if (kDebugMode) {
          print('[FCM InitialMessage] Cold-launch from notification: ${initialMessage.data}');
        }
        WidgetsBinding.instance.addPostFrameCallback((_) {
          handleNotificationClick(initialMessage.data);
        });
      }

      _isInitialized = true;
    } catch (err) {
      if (kDebugMode) {
        print('[FCM Init Failed] Running in graceful mode: $err');
      }
    }
  }

  /// Ensures current device FCM token is retrieved and registered with the server
  static Future<String?> ensureDeviceRegistered() async {
    try {
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        criticalAlert: true,
      );

      final token = await messaging.getToken();
      if (token != null && token.isNotEmpty) {
        if (kDebugMode) {
          print('[FCM ensureDeviceRegistered] Token: $token');
        }
        await ApiService.registerFcmToken(
          token,
          deviceName: kIsWeb ? 'Admin Web Browser' : 'Admin Android Device',
          platform: kIsWeb ? 'web' : 'android',
        );
        return token;
      }
    } catch (e) {
      if (kDebugMode) {
        print('[FCM ensureDeviceRegistered Error] $e');
      }
    }
    return null;
  }

  /// Deep Links and routes directly to the corresponding screen based on notification payload data
  static void handleNotificationClick(Map<String, dynamic> data) {
    final type = data['type']?.toString().toUpperCase() ?? '';
    final orderId = data['orderId']?.toString();
    final productId = data['productId']?.toString();

    final nav = navigatorKey.currentState;
    if (nav == null) return;

    if (type == 'ORDER' || orderId != null) {
      // Navigate directly to the Orders tab (index 2) with order target
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => AdminDashboardScreen(
            initialTab: 2,
            targetOrderId: orderId,
          ),
        ),
        (route) => false,
      );
    } else if (type == 'PRODUCT' || productId != null) {
      // Navigate directly to the Products tab (index 1) with product target
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => AdminDashboardScreen(
            initialTab: 1,
            targetProductId: productId,
          ),
        ),
        (route) => false,
      );
    } else if (type == 'INQUIRY') {
      // Navigate directly to Inquiries Screen
      nav.push(
        MaterialPageRoute(
          builder: (_) => const InquiriesScreen(),
        ),
      );
    } else {
      // General notification: open dashboard home
      nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => const AdminDashboardScreen(initialTab: 0),
        ),
        (route) => false,
      );
    }
  }

  /// Shows an elegant in-app notification banner when message arrives while app is open
  static void _showForegroundNotificationBanner(RemoteMessage message) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    final title = message.notification?.title ?? '🪔 Sacred Notification';
    final body = message.notification?.body ?? 'New Sanctum alert received.';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: const Duration(seconds: 5),
        backgroundColor: const Color(0xFF031910),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: TempleColors.goldPrimary, width: 1.2),
        ),
        content: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                color: Color(0xFF0A3725),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_active_rounded,
                color: TempleColors.goldPrimary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: TempleColors.goldPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    body,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11.5,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        action: SnackBarAction(
          label: 'VIEW',
          textColor: TempleColors.goldBright,
          onPressed: () {
            handleNotificationClick(message.data);
          },
        ),
      ),
    );
  }
}
