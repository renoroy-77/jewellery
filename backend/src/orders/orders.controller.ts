import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders Management')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devotee orders with status filter & search' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll({ status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by order ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new sacred order' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order fulfillment or consecration status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Post('test-telegram')
  @ApiOperation({ summary: 'Send a test ping notification to configured Telegram chat' })
  testTelegram() {
    return this.ordersService.testTelegram();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or cancel order by ID' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
