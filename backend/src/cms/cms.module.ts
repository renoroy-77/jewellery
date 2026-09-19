import { Module } from '@nestjs/common';
import { HeroSlidesController } from './hero-slides/hero-slides.controller';
import { HeroSlidesService } from './hero-slides/hero-slides.service';
import { StoryBannersController } from './story-banners/story-banners.controller';
import { StoryBannersService } from './story-banners/story-banners.service';
import { AnnouncementsController } from './announcements/announcements.controller';
import { AnnouncementsService } from './announcements/announcements.service';
import { FaqsController } from './faqs/faqs.controller';
import { FaqsService } from './faqs/faqs.service';
import { PublicCmsController } from './public-cms.controller';

@Module({
  controllers: [
    HeroSlidesController,
    StoryBannersController,
    AnnouncementsController,
    FaqsController,
    PublicCmsController,
  ],
  providers: [
    HeroSlidesService,
    StoryBannersService,
    AnnouncementsService,
    FaqsService,
  ],
  exports: [
    HeroSlidesService,
    StoryBannersService,
    AnnouncementsService,
    FaqsService,
  ],
})
export class CmsModule {}
