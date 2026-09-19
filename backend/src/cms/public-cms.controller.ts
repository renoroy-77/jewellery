import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HeroSlidesService } from './hero-slides/hero-slides.service';
import { StoryBannersService } from './story-banners/story-banners.service';
import { AnnouncementsService } from './announcements/announcements.service';
import { FaqsService } from './faqs/faqs.service';

@ApiTags('Public CMS (Storefront)')
@Controller('api/cms/storefront')
export class PublicCmsController {
  constructor(
    private readonly heroSlidesService: HeroSlidesService,
    private readonly storyBannersService: StoryBannersService,
    private readonly announcementsService: AnnouncementsService,
    private readonly faqsService: FaqsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated active CMS data for public storefront' })
  async getStorefrontContent() {
    const [heroSlides, storyBanners, announcement, faqs] = await Promise.all([
      this.heroSlidesService.findAll(true),
      this.storyBannersService.findAll(true),
      this.announcementsService.getActive(),
      this.faqsService.findAll(true),
    ]);

    return {
      heroSlides,
      storyBanners,
      announcement,
      faqs,
      timestamp: new Date().toISOString(),
    };
  }
}
