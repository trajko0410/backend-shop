import { forwardRef, Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './provider/newsletter.service';
import { UsersModule } from 'src/users/users.module';
import { ItemsModule } from 'src/items/items.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from './newsletterSubsribe.schema';
import { MailTrAPModule } from 'src/mailtrap/mailtrap.module';

@Module({
  controllers: [NewsletterController],
  providers: [NewsletterService],
  imports: [
    forwardRef(() => UsersModule),
    ItemsModule,
    MongooseModule.forFeature([
      { name: Newsletter.name, schema: NewsletterSchema },
    ]),
    MailTrAPModule,
  ],
})
export class NewsletterModule {}
