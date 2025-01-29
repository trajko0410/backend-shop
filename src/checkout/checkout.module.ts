import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { CheckOutService } from './provider/checkout.service';
import { CheckoutController } from './checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemsSchema } from 'src/items/item.schema';
import { User, UserSchema } from 'src/users/user.schema';
import { OrderSchema, Order } from './order.schema';
import { MailerModule } from '@nestjs-modules/mailer';
//import { RawBodyMiddleware } from 'src/middleware/raw-body.middleware';

@Module({
  providers: [CheckOutService],
  controllers: [CheckoutController],
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemsSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    forwardRef(() => MailerModule),
  ],
})
/*
export class CheckoutModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the middleware to the specific route
    consumer.apply(RawBodyMiddleware).forRoutes('checkout/webhooks/stripe'); // Only for the /webhooks/stripe route
  }
}*/
export class CheckoutModule {}
