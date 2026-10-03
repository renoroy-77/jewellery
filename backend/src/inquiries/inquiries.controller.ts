import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@ApiTags('Devotee Inquiries')
@Controller('api/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inquiries with optional filtering' })
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.inquiriesService.findAll(status, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single inquiry by id or reference' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit new devotee inquiry' })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inquiry status or notes' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inquiry status or notes (idempotent PUT)' })
  putUpdate(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inquiry permanently from backend' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
