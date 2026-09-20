import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemWalletDto {
  @ApiProperty({ example: 100, description: 'Amount in Rupees to redeem from wallet' })
  @IsNumber()
  @Min(1)
  amount: number;
}
