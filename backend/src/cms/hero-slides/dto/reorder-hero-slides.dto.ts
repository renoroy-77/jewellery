import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class ReorderHeroSlidesDto {
  @ApiProperty({ type: [Number], description: 'Ordered list of HeroSlide IDs' })
  @IsArray()
  @IsInt({ each: true })
  slideIds: number[];
}
