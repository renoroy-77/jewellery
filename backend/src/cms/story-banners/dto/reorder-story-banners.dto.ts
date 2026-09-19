import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderStoryBannersDto {
  @ApiProperty({ type: [String], description: 'Ordered list of StoryBanner IDs' })
  @IsArray()
  @IsString({ each: true })
  bannerIds: string[];
}
