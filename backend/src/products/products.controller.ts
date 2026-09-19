import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products Management')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with search & category filters' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('inStock') inStock?: string,
    @Query('featured') featured?: string,
  ) {
    return this.productsService.findAll({
      category,
      search,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
      featured: featured !== undefined ? featured === 'true' : undefined,
    });
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get product by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findOne(idOrSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/toggle-stock')
  @ApiOperation({ summary: 'Toggle inStock status' })
  toggleStock(@Param('id') id: string) {
    return this.productsService.toggleStock(id);
  }

  @Patch(':id/toggle-featured')
  @ApiOperation({ summary: 'Toggle featured status' })
  toggleFeatured(@Param('id') id: string) {
    return this.productsService.toggleFeatured(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by ID' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
