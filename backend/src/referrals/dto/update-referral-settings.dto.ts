import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateReferralSettingsDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  refereeDiscountRupees?: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  referrerRewardRupees?: number;

  @IsNumber()
  @Min(0)
  @Max(100000)
  @IsOptional()
  minOrderSubtotal?: number;
}

