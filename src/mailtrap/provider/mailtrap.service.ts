import {
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import { MailerService } from '@nestjs-modules/mailer';
import { SendNewsletterDto } from 'src/newsletter/dto/createnewsletter.dto';
import { User } from 'src/users/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MailTrapService {
  constructor(
    //importinf mailer which is part of nestmodule
    private readonly mailerService: MailerService,

    //importing user database
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  //SEND EMAIL
  private async sendEmail(
    to: string[],
    subject: string,
    text: string,
    html: string = '',
    attachments: {
      filename: string; // Name of the file as seen by the recipient
      path?: string; // Local file path
      content?: Buffer | string; // Buffer for file content
      contentType?: string; // MIME type
    }[] = [],
  ) {
    const mailOptions = {
      from: 'noreplly@demomailtrap.com', // Replace with your sender email
      to: to.join(', '), // Join email array for the 'to' field
      subject: subject,
      text: text,
      html: html,
      attachments,
    };

    //console.log(mailOptions, 'mailOptions');

    try {
      await this.mailerService.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to.join(', ')}`);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to send email at the moment. Please try again later.',
        {
          description: 'Error sending email.',
        },
      );
    }
  }

  //SEND WELCOME EMAIL
  public async sendWelcomeEmail(userEmail: string) {
    const subject = 'Welcome to Our Newsletter Service!';

    const emailTemplatePath = path.join(
      __dirname,
      '../../../', // Going up to the parent folder (dist)
      'src',
      'mailtrap',
      'templates',
      'email.ejs',
    );

    try {
      const html = await ejs.renderFile(emailTemplatePath, { userEmail });

      // Plain text version (fallback for email clients that don’t support HTML)
      const text = `Hello ${userEmail},\n\nThank you for signing up! We are excited to have you on board.`;

      await this.sendEmail([userEmail], subject, text, html);
    } catch (error) {
      //console.error('Error rendering EJS template or sending email:', error);
      throw new InternalServerErrorException(
        'There was an issue rendering the email template or sending the email. Please try again later.',
        'Error rendering template or sending email',
      );
    }
  }

  public async sendCheckOutEmail(userEmail: string) {
    const subject = 'Welcome to Our Newsletter Service!';

    const emailTemplatePath = path.join(
      __dirname,
      '../../../', // Going up to the parent folder (dist)
      'src',
      'mailtrap',
      'templates',
      'checkout.ejs',
    );

    try {
      const html = await ejs.renderFile(emailTemplatePath, { userEmail });

      // Plain text version (fallback for email clients that don’t support HTML)
      const text = `Hello ${userEmail},\n\nThank you for signing up! We are excited to have you on board.`;

      await this.sendEmail([userEmail], subject, text, html);
    } catch (error) {
      console.error('Error rendering EJS template or sending email:', error);
      throw new InternalServerErrorException(
        'There was an issue rendering the email template or sending the email. Please try again later.',
        'Error rendering template or sending email',
      );
    }
  }

  private async getRecipientNameOrEmail(email: string): Promise<string> {
    try {
      const user = await this.userModel.find({ email: email });

      if (!user || user.length === 0) {
        return email.split('@')[0];
      }

      if (user[0].name && user[0].lastname) {
        return `${user[0].name} ${user[0].lastname}`;
      }

      return email.split('@')[0];
    } catch (error) {
      console.error('Error fetching user data:', email, error);
      // In case of an error, return email part before '@'
      return email.split('@')[0];
    }
  }

  async sendEmailWithTemplate(
    templatePath: string,
    sendNewsletterDto: SendNewsletterDto,
    subscribers: { email: string }[],
    attachments: {
      filename: string; // Name of the file as seen by the recipient
      content?: Buffer | string; // Buffer for file content
      contentType?: string; // MIME type
    }[] = [],
  ) {
    try {
      const htmlData = await Promise.all(
        subscribers.map(async (subscriber) => {
          const recipientName = await this.getRecipientNameOrEmail(
            subscriber.email,
          );

          //can add data so we could input name of user etc etc
          const html = await ejs.renderFile(templatePath, {
            data: recipientName,
          });

          return {
            email: subscriber.email,
            html,
          };
        }),
      );

      for (const { email, html } of htmlData) {
        await this.checkEmailSize(sendNewsletterDto.text, html, attachments);

        // Send email for each subscriber
        await this.sendEmail(
          [email],
          sendNewsletterDto.subject,
          sendNewsletterDto.text,
          html,
          attachments,
        );
      }

      return {
        message: 'Emmail sent succesfuly',
        statsCode: 201,
      };
    } catch (error) {
      //console.error('Error rendering template or sending email:', error);
      //throw error; // Re-throw the error to propagate correctly
      return error;
    }
  }

  private async checkEmailSize(
    text: string,
    html: string,
    attachments: {
      filename: string; // Name of the file as seen by the recipient
      path?: string; // Local file path
      content?: Buffer | string; // Buffer for file content
      contentType?: string;
    }[],
  ): Promise<number> {
    // Calculate size of text and html content
    const textSize = Buffer.byteLength(text, 'utf-8');
    const htmlSize = Buffer.byteLength(html, 'utf-8');

    // Calculate the size of the attachments
    let attachmentsSize = 0;
    for (const attachment of attachments) {
      if (Buffer.isBuffer(attachment.content)) {
        attachmentsSize += attachment.content.length;
      } else {
        attachmentsSize += Buffer.byteLength(attachment.content, 'utf-8');
      }
    }

    // Total size
    const totalSize = textSize + htmlSize + attachmentsSize;
    console.log(textSize, htmlSize, attachmentsSize, totalSize, 'sizes');
    // You can set your desired email size limit here (e.g., 4MB)
    const maxEmailSize = 4 * 1024 * 1024; // 4MB in bytes

    // Check if the email exceeds the size limit
    if (totalSize > maxEmailSize) {
      const errorMessage = `Email size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed size of ${(maxEmailSize / 1024 / 1024).toFixed(2)} MB.`;
      throw new InternalServerErrorException(errorMessage, 'Email size error');
    }
    return totalSize;
  }
}
