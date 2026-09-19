import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  private get botToken(): string | undefined {
    return (
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      process.env.TELEGRAM_BOT_TOKEN
    );
  }

  private get chatId(): string | undefined {
    return (
      this.configService.get<string>('TELEGRAM_CHAT_ID') ||
      process.env.TELEGRAM_CHAT_ID
    );
  }

  /**
   * Escape HTML special characters for Telegram HTML mode
   */
  private escapeHtml(text: string | number | null | undefined): string {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Check if Telegram notifications are configured
   */
  isConfigured(): boolean {
    const token = this.botToken;
    const chat = this.chatId;
    return !!(
      token &&
      chat &&
      token !== 'your_bot_token_here' &&
      chat !== 'your_chat_id_here'
    );
  }

  /**
   * Send a raw HTML message to the configured Telegram chat
   */
  async sendMessage(htmlText: string): Promise<boolean> {
    const token = this.botToken;
    const chat = this.chatId;

    if (!this.isConfigured()) {
      this.logger.debug(
        'Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env',
      );
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat,
          text: htmlText,
          parse_mode: 'HTML',
        }),
      });

      const data = (await response.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        this.logger.warn(`Telegram API error: ${data.description}`);
        return false;
      }

      this.logger.log('Telegram notification sent successfully.');
      return true;
    } catch (error: any) {
      this.logger.warn(
        `Failed to send Telegram notification: ${error.message || error}`,
      );
      return false;
    }
  }

  /**
   * Send new order alert to store admin
   */
  async sendOrderNotification(order: any): Promise<boolean> {
    try {
      const itemsList = Array.isArray(order.items)
        ? order.items
            .map(
              (item: any, idx: number) =>
                `  ${idx + 1}. <b>${this.escapeHtml(item.name || 'Item')}</b> x${item.quantity || 1} — ₹${Number(item.price || 0).toLocaleString('en-IN')}`,
            )
            .join('\n')
        : '  • Custom Order Items';

      const totalFormatted = Number(order.totalAmount || 0).toLocaleString(
        'en-IN',
      );

      const message = [
        `🛒 <b>NEW SACRED ORDER RECEIVED!</b>`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `🆔 <b>Order ID:</b> <code>#${this.escapeHtml(order.id)}</code>`,
        `👤 <b>Devotee:</b> ${this.escapeHtml(order.devoteeName)}`,
        `📞 <b>Phone:</b> ${this.escapeHtml(order.phone)}`,
        `✉️ <b>Email:</b> ${this.escapeHtml(order.email)}`,
        ``,
        `📦 <b>Items Ordered:</b>`,
        itemsList,
        ``,
        `💰 <b>Total Amount:</b> ₹${totalFormatted}` +
          (order.referralCodeUsed
            ? `\n🎁 <b>Referral Code:</b> <code>${this.escapeHtml(order.referralCodeUsed)}</code> (Saved ₹${Number(order.referralDiscount || 0).toLocaleString('en-IN')})`
            : ''),
        `💳 <b>Payment Method:</b> ${this.escapeHtml(order.paymentMethod || 'Online')}`,
        `📊 <b>Status:</b> <b>${this.escapeHtml(order.status || 'Pending')}</b>`,
        ``,
        `📍 <b>Delivery Address:</b>`,
        `${this.escapeHtml(order.shippingAddress || 'Not provided')}`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `📅 <i>${this.escapeHtml(order.date || new Date().toLocaleString())}</i>`,
      ].join('\n');

      return await this.sendMessage(message);
    } catch (err: any) {
      this.logger.warn(`Error compiling order notification: ${err.message}`);
      return false;
    }
  }

  /**
   * Send order status update alert (e.g. Consecrated, Shipped, Delivered)
   */
  async sendOrderStatusUpdate(
    order: any,
    previousStatus: string,
    cancellationReason?: string,
  ): Promise<boolean> {
    try {
      const isCancelled = String(order.status).toLowerCase() === 'cancelled';
      const header = isCancelled
        ? `🚫 <b>ORDER CANCELLED ALERT</b>`
        : `🔔 <b>ORDER STATUS UPDATED</b>`;

      const statusLine = isCancelled
        ? `⚠️ <b>Status:</b> <s>${this.escapeHtml(previousStatus)}</s> ➔ <b style="color:red">CANCELLED</b>`
        : `🔄 <b>Status Changed:</b> <s>${this.escapeHtml(previousStatus)}</s> ➔ <b>${this.escapeHtml(order.status)}</b>`;

      const message = [
        header,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `🆔 <b>Order ID:</b> <code>#${this.escapeHtml(order.id)}</code>`,
        `👤 <b>Devotee:</b> ${this.escapeHtml(order.devoteeName)}`,
        statusLine,
        isCancelled && cancellationReason
          ? `📝 <b>Cancellation Reason:</b> <i>${this.escapeHtml(cancellationReason)}</i>`
          : '',
        order.trackingNumber
          ? `🚚 <b>Tracking Number:</b> <code>${this.escapeHtml(order.trackingNumber)}</code>`
          : '',
        `💰 <b>Order Amount:</b> ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`,
        isCancelled ? `❗ <i>Store inventory may be restored.</i>` : '',
        `━━━━━━━━━━━━━━━━━━━━━━`,
      ]
        .filter(Boolean)
        .join('\n');

      return await this.sendMessage(message);
    } catch (err: any) {
      this.logger.warn(`Error compiling status update notification: ${err.message}`);
      return false;
    }
  }

  /**
   * Send verification ping to test bot connection
   */
  async sendTestPing(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message:
          'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing or not set in backend/.env',
      };
    }

    const testMessage = [
      `✨ <b>Aamadappetti Panchaloham Store Bot</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ <b>Telegram Bot Connected Successfully!</b>`,
      `Your e-commerce backend is now linked to this chat.`,
      `You will receive real-time notifications for every incoming order.`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `⏰ <i>Time: ${new Date().toLocaleString()}</i>`,
    ].join('\n');

    const ok = await this.sendMessage(testMessage);
    return {
      success: ok,
      message: ok
        ? 'Test message sent to Telegram successfully!'
        : 'Failed to send message via Telegram API. Check bot token and chat ID.',
    };
  }
}
