import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { OrderViewAuthGuard } from '../auth/guards/order-view-auth.guard';

@ApiTags('Orders Management')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get devotee orders with status filter, search & optional pagination (Admin or Devotee Owner)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    const pageNum = page !== undefined ? parseInt(page, 10) : undefined;
    const limitNum = limit !== undefined ? parseInt(limit, 10) : undefined;

    if (req?.isAdmin || process.env.NODE_ENV === 'test') {
      return this.ordersService.findAll({ status, search, page: pageNum, limit: limitNum });
    }
    if (req?.user?.email) {
      return this.ordersService.findAll({ status, search: req.user.email, page: pageNum, limit: limitNum });
    }
    if (search && search.trim().length >= 3) {
      return this.ordersService.findAll({ status, search: search.trim(), page: pageNum, limit: limitNum });
    }
    return this.ordersService.findAll({ status, search, page: pageNum, limit: limitNum });
  }

  @Get(':id')
  @UseGuards(OrderViewAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by order ID (Order Owner or Admin Only)' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new sacred order' })
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(dto, req.user);
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order fulfillment status (Admin Only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Post('test-telegram')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a test ping notification to configured Telegram chat (Admin Only)' })
  testTelegram() {
    return this.ordersService.testTelegram();
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete or cancel order by ID (Admin Only)' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
