import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@ApiTags('CMS - Announcements')
@Controller('api/cms/announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active announcement and alert settings' })
  getActive() {
    return this.announcementsService.getActive();
  }

  @Put()
  @ApiOperation({ summary: 'Update announcement and alert settings' })
  update(@Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(dto);
  }
}
