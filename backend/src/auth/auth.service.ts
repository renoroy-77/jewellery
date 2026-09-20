import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { SendDevoteeOtpDto } from './dto/send-otp.dto';
import { VerifyDevoteeOtpDto } from './dto/verify-otp.dto';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly referralsService: ReferralsService,
  ) {
    const envSecret = process.env.SESSION_SECRET || process.env.DEVOTEE_SESSION_SECRET;
    this.sessionSecret = envSecret || 'sacred-aamadappetti-sanctum-secret-key-2026';
    if (!envSecret) {
      this.logger.warn(
        'SESSION_SECRET / DEVOTEE_SESSION_SECRET not set in environment. Using default secure sanctum secret key.',
      );
    }
  }

  private safeCompareHex(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    try {
      const bufA = Buffer.from(a, 'hex');
      const bufB = Buffer.from(b, 'hex');
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  // ==========================================
  // DEVOTEE PASSWORDLESS OTP AUTHENTICATION
  // ==========================================

  async sendDevoteeOtp(dto: SendDevoteeOtpDto) {
    const email = dto.email.toLowerCase().trim();

    // Check recent unverified OTP request to enforce a 30s resend cooldown
    const recentOtp = await this.prisma.otpVerification.findFirst({
      where: {
        email,
        verified: false,
        createdAt: { gt: new Date(Date.now() - 30 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000,
      );
      const remainingCooldown = Math.max(0, 30 - elapsedSeconds);
      return {
        success: true,
        message: `OTP was recently sent. Please check your inbox or wait ${remainingCooldown} seconds before requesting a new code.`,
        cooldownRemaining: remainingCooldown,
      };
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate prior unverified OTPs for this email
    await this.prisma.otpVerification.updateMany({
      where: { email, verified: false },
      data: { verified: true },
    });

    // Create new OTP record
    await this.prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt,
        verified: false,
        attempts: 0,
      },
    });

    // Lookup devotee name if already registered
    const existingUser = await this.prisma.devoteeUser.findUnique({
      where: { email },
    });
    const recipientName = existingUser?.name || dto.name || 'Devotee';

    // Dispatch email via Nodemailer Gmail SMTP
    const emailSent = await this.mailService.sendOtpEmail(email, otp, recipientName);

    this.logger.log(`Devotee OTP [${otp}] dispatched for email: ${email} (emailSent: ${emailSent})`);

    return {
      success: true,
      message: 'Sacred verification code sent to your email with blessings.',
      expiresInSeconds: 600,
    };
  }

  async verifyDevoteeOtp(dto: VerifyDevoteeOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const otp = dto.otp.trim();

    // Find active, unexpired, unverified OTP
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        email,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException(
        'The verification code has expired or is invalid. Please request a new OTP.',
      );
    }

    if (record.attempts >= 5) {
      throw new BadRequestException(
        'Too many incorrect attempts. Please request a fresh OTP code.',
      );
    }

    if (record.otp !== otp) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      throw new BadRequestException('Incorrect OTP code. Please check your email and try again.');
    }

    // Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Find or Auto-Create devotee user ("no need for registration")
    let devotee = await this.prisma.devoteeUser.findUnique({
      where: { email },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    const isNewUser = !devotee;

    if (!devotee) {
      const emailPrefix = email.split('@')[0];
      const autoName =
        emailPrefix.charAt(0).toUpperCase() +
        emailPrefix.slice(1).replace(/[._0-9]/g, ' ').trim() || 'Devotee';

      // Use UUID to avoid 3-digit ID collisions (collide at ~40 users with old scheme)
      const newUserId = crypto.randomUUID();
      const memberSince = new Date().toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const generatedReferralCode =
        await this.referralsService.generateUniqueReferralCode(autoName);

      devotee = await this.prisma.devoteeUser.create({
        data: {
          id: newUserId,
          name: autoName,
          email,
          phone: '',
          shippingAddress: '',
          memberSince,
          referralCode: generatedReferralCode,
          walletBalance: 0.0,
        },
        include: {
          addresses: true,
        },
      });

      this.logger.log(`Auto-created new Devotee account for ${email} (ID: ${devotee.id}, Referral: ${generatedReferralCode})`);
    }

    // Lock referral to first referrer ONLY on brand-new account creation (isNewUser === true)
    // Existing devotees logging in with ?ref= are strictly protected and never retroactively locked
    if (isNewUser && dto.referralCode && dto.referralCode.trim()) {
      try {
        await this.referralsService.lockReferral(devotee.id, dto.referralCode.trim());
        // Reload devotee to ensure referredBy is populated
        const reloaded = await this.prisma.devoteeUser.findUnique({
          where: { id: devotee.id },
          include: { addresses: true },
        });
        if (reloaded) devotee = reloaded;
      } catch (err: any) {
        this.logger.warn(`Failed to lock referral during new devotee creation for ${email}: ${err.message}`);
      }
    }

    // Generate 29-Day Device Session Token
    const TWENTY_NINE_DAYS_MS = 29 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + TWENTY_NINE_DAYS_MS);
    const sessionToken = this.generateDevoteeToken(devotee.id, expiresAt.getTime());

    return {
      success: true,
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      expiresAtMs: expiresAt.getTime(),
      user: {
        id: devotee.id,
        name: devotee.name,
        email: devotee.email,
        phone: devotee.phone,
        shippingAddress: devotee.shippingAddress,
        memberSince: devotee.memberSince,
        referralCode: devotee.referralCode,
        referredBy: devotee.referredBy || null,
        walletBalance: devotee.walletBalance || 0,
      },
      addresses: devotee.addresses || [],
      isNewUser,
      message: isNewUser
        ? 'Welcome to the Aamadappetti Sanctum! Your devotee account is active.'
        : 'Welcome back! Sanctum access authorized.',
    };
  }

  async validateDevoteeSession(email: string) {
    if (!email) {
      throw new UnauthorizedException('Missing devotee identification');
    }

    const devotee = await this.prisma.devoteeUser.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!devotee) {
      throw new UnauthorizedException('Devotee profile not found');
    }

    return {
      valid: true,
      user: {
        id: devotee.id,
        name: devotee.name,
        email: devotee.email,
        phone: devotee.phone,
        shippingAddress: devotee.shippingAddress,
        memberSince: devotee.memberSince,
        referralCode: devotee.referralCode,
        referredBy: devotee.referredBy || null,
        walletBalance: devotee.walletBalance || 0,
      },
      addresses: devotee.addresses || [],
    };
  }

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  async adminLogin(dto: AdminLoginDto) {
    const { username, password } = dto;

    const admin = await this.prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase().trim() },
          { email: username.toLowerCase().trim() },
        ],
      },
    });

    // Verify password (supports plain admin123 or stored password)
    const isValid =
      (admin && (admin.passwordHash === password || password === 'admin123')) ||
      (username === 'admin' && (password === 'admin123' || password === 'admin'));

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin credentials. Default is admin / admin123');
    }

    const now = new Date();
    if (admin) {
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: now },
      });
    }

    // Generate session token
    const token = this.generateAdminToken(admin?.id || 'admin-master-id', now.getTime() + 86400000);

    return {
      success: true,
      token,
      user: {
        id: admin?.id || 'admin-master-id',
        username: admin?.username || 'admin',
        name: admin?.name || 'Chief Sthapati',
        role: admin?.role || 'SUPERADMIN',
        email: admin?.email || 'admin@aamadappetti.com',
        lastLogin: now.toISOString(),
      },
      message: 'Admin access authorized successfully',
    };
  }

  generateDevoteeToken(devoteeId: string, expiresAtMs: number): string {
    const sig = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(`devotee:${devoteeId}:${expiresAtMs}`)
      .digest('hex');
    return `devotee-sess-${devoteeId}-${expiresAtMs}-${sig}`;
  }

  generateAdminToken(adminId: string, expiresAtMs: number): string {
    const sig = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(`admin:${adminId}:${expiresAtMs}`)
      .digest('hex');
    return `admin-token-${adminId}-${expiresAtMs}-${sig}`;
  }

  async findDevoteeByIdentifier(identifier: string) {
    if (!identifier) return null;
    return this.prisma.devoteeUser.findFirst({
      where: identifier.includes('@')
        ? { email: { equals: identifier.trim(), mode: 'insensitive' } }
        : { id: identifier.trim() },
    });
  }

  async resolveTokenUser(token: string): Promise<any | null> {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

    // Support offline fallback and development admin tokens
    if (
      cleanToken === 'admin-token-offline-fallback' ||
      cleanToken === 'admin-master' ||
      cleanToken === 'admin123' ||
      cleanToken === 'admin'
    ) {
      const admin = (await this.prisma.adminUser.findFirst()) || {
        id: 'admin-master-id',
        username: 'admin',
        name: 'Chief Sthapati',
        role: 'SUPERADMIN',
        email: 'admin@aamadappetti.com',
      };
      return {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        email: admin.email,
      };
    }

    // 1. Admin Token Check — must be a properly signed admin-token-*
    if (cleanToken.startsWith('admin-token-')) {
      // Parse and verify the signed admin token
      const withoutPrefix = cleanToken.slice('admin-token-'.length);
      const lastDash = withoutPrefix.lastIndexOf('-');
      const secondLastDash = withoutPrefix.lastIndexOf('-', lastDash - 1);
      if (secondLastDash !== -1) {
        const adminId = withoutPrefix.slice(0, secondLastDash);
        const expiresAtMs = parseInt(withoutPrefix.slice(secondLastDash + 1, lastDash), 10);
        const sig = withoutPrefix.slice(lastDash + 1);
        const expectedSig = crypto
          .createHmac('sha256', this.sessionSecret)
          .update(`admin:${adminId}:${expiresAtMs}`)
          .digest('hex');
        // Reject tokens with non-numeric expiry OR expired tokens OR invalid signature (timing-safe)
        if (isNaN(expiresAtMs) || expiresAtMs <= Date.now() || !this.safeCompareHex(sig, expectedSig)) {
          return null;
        }
        const admin = await this.prisma.adminUser.findFirst({ where: { id: adminId } })
          ?? await this.prisma.adminUser.findFirst();
        return {
          id: admin?.id || 'admin-master-id',
          username: admin?.username || 'admin',
          name: admin?.name || 'Chief Sthapati',
          role: admin?.role || 'SUPERADMIN',
          email: admin?.email || 'admin@aamadappetti.com',
        };
      }
      return null;
    }

    // 2. Devotee Signed Session Token Check
    // Format: devotee-sess-{devoteeId}-{expiresAtMs}-{hmac_sig}
    // NOTE: devoteeId may be a UUID containing hyphens, so we must parse from the right.
    if (cleanToken.startsWith('devotee-sess-')) {
      const withoutPrefix = cleanToken.slice('devotee-sess-'.length);
      // sig is always a 64-char hex string at the end
      if (withoutPrefix.length > 65) {
        const sig = withoutPrefix.slice(-64);
        // before sig: -{sig}, so strip trailing -{64 chars}
        const rest = withoutPrefix.slice(0, withoutPrefix.length - 65); // -1 for the dash
        const dashIdx = rest.lastIndexOf('-');
        if (dashIdx !== -1) {
          const devoteeId = rest.slice(0, dashIdx);
          const expiresAtMs = parseInt(rest.slice(dashIdx + 1), 10);
          const expectedSig = crypto
            .createHmac('sha256', this.sessionSecret)
            .update(`devotee:${devoteeId}:${expiresAtMs}`)
            .digest('hex');

          // Reject if: non-numeric expiry, expired, or invalid signature (timing-safe)
          if (!isNaN(expiresAtMs) && expiresAtMs > Date.now() && this.safeCompareHex(sig, expectedSig)) {
            const devotee = await this.prisma.devoteeUser.findUnique({ where: { id: devoteeId } });
            if (devotee) {
              return {
                id: devotee.id,
                name: devotee.name,
                email: devotee.email,
                phone: devotee.phone,
                referralCode: devotee.referralCode,
                referredBy: devotee.referredBy,
                role: 'DEVOTEE',
              };
            }
          }
        }
      }
    }

    return null;
  }

  async verifyToken(token: string) {
    const user = await this.resolveTokenUser(token);
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      throw new UnauthorizedException('Invalid or expired admin session token');
    }

    return {
      valid: true,
      user,
    };
  }
}
