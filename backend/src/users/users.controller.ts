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
import { UsersService } from './users.service';
import { CreateDevoteeUserDto } from './dto/create-user.dto';
import { UpdateDevoteeUserDto } from './dto/update-user.dto';

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
}
