import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { NewsletterService } from './provider/newsletter.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { NewsletterSubscribeDto } from './dto/newsletterSubsribe.dto';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { SendNewsletterDto } from './dto/createnewsletter.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Roles('Public', 'User')
  @Post('subscribe')
  @UseInterceptors(AnyFilesInterceptor())
  public subscribeToNewsletter(
    @Body() newsletterSubscribeDto: NewsletterSubscribeDto,
  ) {
    return this.newsletterService.subscribeToNewsletter(newsletterSubscribeDto);
  }

  @Roles('Admin')
  @Post('send-newsletter')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'ejsFile', maxCount: 1 },
      { name: 'attachments', maxCount: 5 },
    ]),
  )
  public sendNewsletter(
    @UploadedFiles()
    files: {
      ejsFile: Express.Multer.File[];
      attachments: Express.Multer.File[];
    },
    @Body() sendNewsletterDto: SendNewsletterDto,
  ) {
    return this.newsletterService.sendNewsletter(files, sendNewsletterDto);
  }
}
