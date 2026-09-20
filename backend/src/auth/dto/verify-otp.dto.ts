import { IsEmail, IsNotEmpty, IsString, Length, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDevoteeOtpDto {
  @ApiProperty({ example: 'devotee@example.com', description: 'Devotee email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP code' })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;

  @ApiProperty({ example: 'DIVINE123', description: 'Optional referral code used during registration / sign in', required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
