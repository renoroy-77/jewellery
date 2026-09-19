import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin', description: 'Admin username or email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Admin password or passcode' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
