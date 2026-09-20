import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly emailUser: string;
  private readonly emailPass: string;

  constructor() {
    this.emailUser = process.env.EMAIL_USER || 'inspitereno@gmail.com';
    this.emailPass = (process.env.EMAIL_PASS || 'dovl ryqc xozd wqwz').replace(/\s+/g, '');
    this.initTransporter();
  }

  private initTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.emailUser,
          pass: this.emailPass,
        },
      });
      this.logger.log(`MailService initialized with sender: ${this.emailUser}`);
    } catch (err: any) {
      this.logger.error(`Failed to initialize nodemailer transporter: ${err.message}`);
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string, recipientName?: string): Promise<boolean> {
    if (!this.transporter) {
      this.initTransporter();
    }

    const displayName = recipientName && recipientName.trim() ? recipientName.trim() : 'Devotee';
    const candidatePaths = [
      path.resolve(__dirname, 'assets/brand_logo.png'),
      path.resolve(__dirname, '../../src/mail/assets/brand_logo.png'),
      path.resolve(process.cwd(), 'src/mail/assets/brand_logo.png'),
      path.resolve(process.cwd(), '../public/assets/brand_logo_gold.png'),
      path.resolve(process.cwd(), '../public/assets/brand_logo.png'),
      path.resolve(process.cwd(), 'public/assets/brand_logo.png'),
    ];
    let logoPath = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        logoPath = p;
        break;
      }
    }
    const hasLogoFile = Boolean(logoPath);

    const attachments: any[] = [];
    if (hasLogoFile) {
      attachments.push({
        filename: 'aamadappetti-logo.png',
        path: logoPath,
        cid: 'brand_logo',
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sacred Login Code - Aamadappetti</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f8f7f2" style="background-color: #f8f7f2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="max-width: 520px; background-color: #ffffff; border: 1.5px solid #e6d7ad; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);">
          
          <!-- Top Gold Temple Stripe -->
          <tr>
            <td style="background: linear-gradient(90deg, #aa7c11 0%, #d4af37 50%, #aa7c11 100%); height: 5px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Brand Logo -->
          <tr>
            <td align="center" style="padding: 36px 24px 18px 24px; text-align: center; background-color: #ffffff;">
              ${
                hasLogoFile
                  ? `<img src="cid:brand_logo" alt="Aamadappetti Panchaloham" width="170" style="display: block; margin: 0 auto; max-width: 190px; height: auto; border: 0;" />`
                  : `<h1 style="color: #996515; font-size: 26px; margin: 0; font-family: Georgia, serif; letter-spacing: 2px; text-transform: uppercase;">AAMADAPPETTI</h1>`
              }
              <div style="margin-top: 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #aa7c11; font-weight: 700;">
                Sacred Panchaloham &bull; Consecrated Temple Treasures
              </div>
              <div style="width: 120px; height: 1.5px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 16px auto 0 auto;"></div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 32px 28px 32px; text-align: center; background-color: #ffffff;">
              <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 10px 0; font-family: Georgia, serif; font-weight: 600; letter-spacing: 0.3px;">
                Namaste, ${displayName}
              </h2>
              <p style="color: #475569; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px 0;">
                Use the sacred one-time verification code below to seamlessly enter your Aamadappetti Sanctum. No passwords required.
              </p>

              <!-- OTP Golden Badge -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center">
                    <div style="background-color: #fdfbf7; border: 2px solid #d4af37; border-radius: 14px; padding: 22px 20px; max-width: 320px; text-align: center; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.15);">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #996515; margin-bottom: 8px; font-weight: 700;">
                        ONE-TIME VERIFICATION CODE
                      </div>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #8a6414; padding: 6px 0; text-align: center; text-indent: 10px;">
                        ${otpCode}
                      </div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                        &#x23F1; Valid for <strong style="color: #0f172a;">10 minutes</strong> &bull; Single use only
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Hassle-Free Elderly Feature Reassurance -->
              <div style="background-color: #faf6eb; border: 1px solid #ebd9a2; border-radius: 10px; padding: 14px 18px; text-align: left; margin-bottom: 24px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 16px; margin-right: 10px; color: #aa7c11;">&#x2728;</span>
                  <div style="font-size: 12.5px; color: #334155; line-height: 1.5;">
                    <strong style="color: #8a6414;">Zero Hassle Device Login:</strong> Once verified, your device securely keeps you logged in for <strong style="color: #0f172a;">29 days</strong> so you never need to remember passwords or re-login.
                  </div>
                </div>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                If you did not request this code, please disregard this email. Your sanctum account remains completely safe.
              </p>
            </td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td style="background-color: #faf8f5; padding: 22px 24px; text-align: center; border-top: 1px solid #ebd9a2;">
              <div style="font-size: 12px; color: #786b58; font-weight: 600; letter-spacing: 0.5px;">
                Aamadappetti Sacred Metalcraft &bull; Swarnapuri Guild
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 5px;">
                Authentic 5-Metal Panchaloham &bull; Government Assay Certified Purity
              </div>
              <div style="font-size: 11px; color: #aa7c11; margin-top: 10px; font-style: italic; font-weight: 500;">
                &ldquo;Faith In Every Detail &bull; May Divine Grace Fill Your Home&rdquo;
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      if (!this.transporter) {
        throw new Error('Transporter not available');
      }

      const info = await this.transporter.sendMail({
        from: `"Aamadappetti Sanctum" <${this.emailUser}>`,
        to: toEmail,
        subject: `Your Sacred Login Code: ${otpCode} | Aamadappetti`,
        text: `Namaste ${displayName},\n\nYour Aamadappetti sacred one-time login code is: ${otpCode}\n\nValid for 10 minutes. Once verified, you will remain logged in on this device for 29 days without needing a password.\n\nBlessings,\nAamadappetti Panchaloham`,
        html: htmlContent,
        attachments,
      });

      this.logger.log(`OTP email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send OTP email to ${toEmail}: ${err.message}`);
      return false;
    }
  }
}
