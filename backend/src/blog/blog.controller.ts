import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog & Articles Management')
@Controller('api/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published blog articles with category & search filter' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.findAll({ category, search });
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get blog article by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.blogService.findOne(idOrSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Create and publish new blog article' })
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog article by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog article by ID' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
