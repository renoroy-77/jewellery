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
import { UsersService } from './users.service';
import { CreateDevoteeUserDto } from './dto/create-user.dto';
import { UpdateDevoteeUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Devotees & Users Management')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devotee registered users with search & order summary' })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get devotee profile with associated order history' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new devotee user profile' })
  create(@Body() dto: CreateDevoteeUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update devotee profile details' })
  update(@Param('id') id: string, @Body() dto: UpdateDevoteeUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete devotee profile by ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ==========================================
  // E-COMMERCE ADDRESS BOOK ENDPOINTS
  // ==========================================

  @Get(':devoteeId/addresses')
  @ApiOperation({ summary: 'Get all saved shipping addresses for a devotee' })
  getAddresses(@Param('devoteeId') devoteeId: string) {
    return this.usersService.getAddresses(devoteeId);
  }

  @Post(':devoteeId/addresses')
  @ApiOperation({ summary: 'Add a new shipping address to devotee profile' })
  addAddress(
    @Param('devoteeId') devoteeId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.addAddress(devoteeId, dto);
  }

  @Put(':devoteeId/addresses/:addressId')
  @ApiOperation({ summary: 'Update an existing shipping address' })
  updateAddress(
    @Param('devoteeId') devoteeId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(devoteeId, addressId, dto);
  }

  @Delete(':devoteeId/addresses/:addressId')
  @ApiOperation({ summary: 'Delete a shipping address' })
  deleteAddress(
    @Param('devoteeId') devoteeId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.deleteAddress(devoteeId, addressId);
  }

  @Patch(':devoteeId/addresses/:addressId/default')
  @ApiOperation({ summary: 'Set address as primary default' })
  setDefaultAddress(
    @Param('devoteeId') devoteeId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.setDefaultAddress(devoteeId, addressId);
  }
}
