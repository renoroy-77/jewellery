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
import { CheckoutSettingsController } from './checkout-settings/checkout-settings.controller';
import { CheckoutSettingsService } from './checkout-settings/checkout-settings.service';

@Module({
  controllers: [
    HeroSlidesController,
    StoryBannersController,
    AnnouncementsController,
    FaqsController,
    PublicCmsController,
    CheckoutSettingsController,
  ],
  providers: [
    HeroSlidesService,
    StoryBannersService,
    AnnouncementsService,
    FaqsService,
    CheckoutSettingsService,
  ],
  exports: [
    HeroSlidesService,
    StoryBannersService,
    AnnouncementsService,
    FaqsService,
    CheckoutSettingsService,
  ],
})
export class CmsModule {}
