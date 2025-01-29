import { Global, Module } from '@nestjs/common';
import { MailTrapService } from './provider/mailtrap.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { User, UserSchema } from 'src/users/user.schema';

@Global()
@Module({
  providers: [MailTrapService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAILTRAP_HOST, // MailTrap SMTP host
          port: 2525, // MailTrap SMTP port
          secure: false,
          auth: {
            user: process.env.MAILTRAP_USER, // MailTrap SMTP username
            pass: process.env.MAILTRAP_PASS, // MailTrap SMTP password
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>', // Default from address
        },

        template: {
          dir: join(__dirname, '../../../src/mailtrap/templates'), // Email templates folder
          adapter: new EjsAdapter({ inlineCssEnabled: true }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  exports: [MailTrapService],
})
export class MailTrAPModule {}
