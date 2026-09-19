import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StoryBannersService } from './story-banners.service';
import { CreateStoryBannerDto } from './dto/create-story-banner.dto';
import { UpdateStoryBannerDto } from './dto/update-story-banner.dto';
import { ReorderStoryBannersDto } from './dto/reorder-story-banners.dto';

@ApiTags('CMS - Story Banners')
@Controller('api/cms/story-banners')
export class StoryBannersController {
  constructor(private readonly storyBannersService: StoryBannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all story banners' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.storyBannersService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single story banner by ID' })
  findOne(@Param('id') id: string) {
    return this.storyBannersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new story banner' })
  create(@Body() dto: CreateStoryBannerDto) {
    return this.storyBannersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing story banner' })
  update(@Param('id') id: string, @Body() dto: UpdateStoryBannerDto) {
    return this.storyBannersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a story banner' })
  remove(@Param('id') id: string) {
    return this.storyBannersService.remove(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Update sort order of story banners' })
  reorder(@Body() dto: ReorderStoryBannersDto) {
    return this.storyBannersService.reorder(dto);
  }
}
