import { IsNumber, IsBoolean, IsString, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCheckoutSettingsDto {
  @ApiPropertyOptional({ example: 99.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number;

  @ApiPropertyOptional({ example: 999.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  giftPackagingFee?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  giftPackagingEnabled?: boolean;

  @ApiPropertyOptional({ example: 'FREE' })
  @IsOptional()
  @IsString()
  giftPackagingText?: string;

  @ApiPropertyOptional({ example: 'Insured Express Shipping' })
  @IsOptional()
  @IsString()
  expressShippingText?: string;

  @ApiPropertyOptional({ example: 199.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expressShippingFee?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  velvetPackaging?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  assayCertificate?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  insuredTransit?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  internationalDelivery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  courierPartners?: any;
}
