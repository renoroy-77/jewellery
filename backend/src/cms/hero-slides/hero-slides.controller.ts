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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HeroSlidesService } from './hero-slides.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { ReorderHeroSlidesDto } from './dto/reorder-hero-slides.dto';

@ApiTags('CMS - Hero Slides')
@Controller('api/cms/hero-slides')
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all hero slides' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.heroSlidesService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hero slide by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.heroSlidesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hero slide' })
  create(@Body() dto: CreateHeroSlideDto) {
    return this.heroSlidesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing hero slide' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroSlideDto) {
    return this.heroSlidesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hero slide' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.heroSlidesService.remove(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Update sort order of hero slides' })
  reorder(@Body() dto: ReorderHeroSlidesDto) {
    return this.heroSlidesService.reorder(dto);
  }
}
