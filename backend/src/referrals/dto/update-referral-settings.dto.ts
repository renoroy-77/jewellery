import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateReferralSettingsDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  refereeDiscountRupees?: number;

  @IsNumber()
  @IsOptional()
  referrerRewardRupees?: number;

  @IsNumber()
  @IsOptional()
  minOrderSubtotal?: number;
}
