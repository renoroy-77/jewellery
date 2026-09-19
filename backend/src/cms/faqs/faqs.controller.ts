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
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ReorderFaqsDto } from './dto/reorder-faqs.dto';

@ApiTags('CMS - FAQs')
@Controller('api/cms/faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.faqsService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single FAQ by ID' })
  findOne(@Param('id') id: string) {
    return this.faqsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  create(@Body() dto: CreateFaqDto) {
    return this.faqsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing FAQ' })
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ' })
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Update sort order of FAQs' })
  reorder(@Body() dto: ReorderFaqsDto) {
    return this.faqsService.reorder(dto);
  }
}
