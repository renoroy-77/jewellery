import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CmsModule } from './cms/cms.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { BlogModule } from './blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TelegramModule } from './telegram/telegram.module';
import { PaymentsModule } from './payments/payments.module';
import { ReferralsModule } from './referrals/referrals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CmsModule,
    MediaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UsersModule,
    BlogModule,
    DashboardModule,
    TelegramModule,
    PaymentsModule,
    ReferralsModule,
  ],
})
export class AppModule {}
