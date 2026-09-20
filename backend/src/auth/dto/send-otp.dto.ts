import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendDevoteeOtpDto {
  @ApiProperty({ example: 'devotee@example.com', description: 'Devotee email address to receive OTP' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({ example: 'Sundararajan', required: false, description: 'Optional name for personalization' })
  @IsOptional()
  @IsString()
  name?: string;
}
