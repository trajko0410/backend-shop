import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { NewsletterSubscribeDto } from '../dto/newsletterSubsribe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Newsletter } from '../newsletterSubsribe.schema';
import { Model } from 'mongoose';
import { MailTrapService } from 'src/mailtrap/provider/mailtrap.service';
import * as fs from 'fs';
import * as path from 'path';
import { SendNewsletterDto } from '../dto/createnewsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    //import database
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<Newsletter>,

    //import mailer
    private readonly mailerService: MailTrapService,
    //import cludinary
    //private readonly cloudinaryHelper: CloudinaryHelper,
  ) {}

  //SUBSCRIBE TO NEWSLETTER
  public async subscribeToNewsletter(
    newsletterSubscribeDto: NewsletterSubscribeDto,
  ) {
    let user = undefined;
    try {
      user = await this.newsletterModel
        .findOne({ email: newsletterSubscribeDto.email })
        .exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try again later',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    if (user) {
      throw new BadRequestException(
        'The user with this email is already subscribed, plese try again with diffrent email.',
      );
    }

    try {
      await this.mailerService.sendWelcomeEmail(newsletterSubscribeDto.email);
    } catch (error) {
      console.log(error);
    }
    try {
      const subscribe = new this.newsletterModel(newsletterSubscribeDto);
      await subscribe.save();
      return {
        subscribe,
        message: 'Succesfuly Subscribed!',
        statusCode: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error saving user to database.', {
        description:
          'An unexpected error occurred while saving user to the database. Please try again later.',
      });
    }
  }

  //SEND CUSTOM EJS FILE NEWSLETTER
  public async sendNewsletter(
    files: {
      ejsFile: Express.Multer.File[];
      attachments: Express.Multer.File[];
    },
    sendNewsletterDto: SendNewsletterDto,
  ) {
    const { ejsFile, attachments } = files;
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

    if (!ejsFile || ejsFile.length === 0) {
      throw new BadRequestException('EJS file is required.');
    }

    const tempFilePath = path.join(
      __dirname,
      '../../../', // Going up to the parent folder (dist)
      'src',
      'mailtrap',
      'uploads',
      ejsFile[0].originalname,
    );

    let subscribers = undefined;
    try {
      subscribers = await this.newsletterModel.find().exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try again later',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    if (!subscribers || subscribers.length === 0) {
      throw new BadRequestException('Thera are no subscribers!');
    }

    fs.writeFileSync(tempFilePath, ejsFile[0].buffer); // Save the uploaded file temporarily

    // Prepare attachments for email

    let attachmentData = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        // Check the size of each attachment
        //console.log(attachment.size, 'Size', MAX_FILE_SIZE);
        if (attachment.size > MAX_FILE_SIZE) {
          throw new BadRequestException(
            `Attachment ${attachment.originalname} exceeds the size limit of 25MB.`,
          );
        }

        // Add the valid attachment to the list
        attachmentData.push({
          filename: attachment.originalname,
          content: attachment.buffer,
          contentType: attachment.mimetype,
        });
      }
    }

    try {
      const sendingEmail = await this.mailerService.sendEmailWithTemplate(
        tempFilePath,
        sendNewsletterDto,
        subscribers,
        attachmentData,
      );
      return sendingEmail;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while sending the email.',
      );
    } finally {
      // Clean up the temporary EJS file
      fs.unlinkSync(tempFilePath);
    }
  }
}
