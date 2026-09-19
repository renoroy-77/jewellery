import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories Management')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get category by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findOne(idOrSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Create new product category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product category by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product category by ID' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
