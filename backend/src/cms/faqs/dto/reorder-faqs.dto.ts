import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderFaqsDto {
  @ApiProperty({ type: [String], description: 'Ordered list of FAQ IDs' })
  @IsArray()
  @IsString({ each: true })
  faqIds: string[];
}
