import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CheckOutDto } from '../dto/checkout.dto';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { Item } from 'src/items/item.schema';
import { User } from 'src/users/user.schema';
import { Stripe } from 'stripe';
import { Order } from '../order.schema';
import { MailTrapService } from 'src/mailtrap/provider/mailtrap.service';

@Injectable()
export class CheckOutService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Order.name)
    private readonly orderMode: Model<Order>,

    @Inject(forwardRef(() => MailTrapService))
    private readonly mailTrapService: MailTrapService,
  ) {
    //seting up stripe
    this.stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
      apiVersion: '2022-08-01',
      typescript: true,
    });
  }

  //geting intent to stripe
  private async handlePayment(
    amount: number,
    currency: string,
    metadata: any,
    shipping: any,
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects the amount in cents
        currency,
        payment_method_types: ['card'],
        metadata,
        shipping: {
          name: shipping.name, // Customer's name
          address: {
            line1: shipping.address.line1,
            city: shipping.address.city,
            //state: shipping.address.state,
            postal_code: shipping.address.postal_code,
            country: shipping.address.country,
          },
        },
        //automatic_payment_methods: { enabled: true },
        //confirm: true,
        // return_url: 'https://www.example.com/success',
      });
      return paymentIntent;
    } catch (error) {
      //console.log(error);
      throw new InternalServerErrorException(
        'Stripe payment intent creation failed',
      );
    }
  }

  //CHECKOUT
  public async checkOut(checkOutDto: CheckOutDto) {
    let totalPrice = 0;
    const itemDetails = [];

    for (const orderItem of checkOutDto.item) {
      let existingItem = undefined;
      existingItem = await this.itemModel.findById(orderItem.itemID).exec();
      if (!existingItem) {
        throw new NotFoundException(
          `Item with ID ${orderItem.itemID} does not exist in the inventory.`,
        );
      }

      if (
        !checkOutDto.adress ||
        !checkOutDto.city ||
        !checkOutDto.country ||
        !checkOutDto.postalcode
      ) {
        throw new InternalServerErrorException(
          'Invalid shipping address provided.',
        );
      }

      const memoryOption = orderItem.memory;
      let itemPrice = existingItem.price;

      if (memoryOption) {
        const memoryMatch = existingItem.memory.find(
          (mem: { memory: string }) => mem.memory === memoryOption,
        );
        if (memoryMatch) {
          itemPrice = memoryMatch.price;
        }
      }

      // Calculate the total price for this item
      const itemTotalPrice = itemPrice * orderItem.amount;
      totalPrice += itemTotalPrice;

      itemDetails.push({
        itemID: orderItem.itemID,
        name: existingItem.name,
        memory: memoryOption || 'Base',
        unitPrice: itemPrice,
        quantity: orderItem.amount,
        totalPrice: itemTotalPrice,
      });
    }
    //console.log(totalPrice, itemDetails, 'detalji');

    const user = checkOutDto.userId
      ? await this.userModel.findById(checkOutDto.userId).exec()
      : null;

    let discount = 0;
    if (user) {
      discount = totalPrice * 0.05; // 5% discount
      totalPrice -= discount;
    }

    const metadata = {
      userId: checkOutDto.userId || 'Public',
      name: checkOutDto.name,
      lastname: checkOutDto.lastname,
      items: JSON.stringify(itemDetails),
      discount: discount,
      email: checkOutDto.email,
    };

    const shipping = {
      name: `${checkOutDto.name} ${checkOutDto.lastname}`,
      address: {
        line1: checkOutDto.adress,
        city: checkOutDto.city,
        //state: checkOutDto.country || '', // Add state if applicable
        postal_code: checkOutDto.postalcode,
        country: checkOutDto.country,
      },
    };

    try {
      const paymentIntent = await this.handlePayment(
        totalPrice,
        'usd',
        metadata,
        shipping,
      );
      return {
        totalPrice,
        discount,
        itemDetails,
        userExists: !!user, // true if user exists, false otherwise
        clientSecret: paymentIntent, // This is needed on the frontend to complete the payment
      };
    } catch (error) {
      //console.log(error);
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  public async handleStripeWebhook(payload: any, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPINT_SECRET_KEY;

    //console.log('Type of req.body:', typeof payload); // Should be 'object' (Buffer)
    //console.log('Raw body (as string):', payload.toString('utf-8'));

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );

      switch (event.type) {
        case 'charge.succeeded': {
          const paymentIntent = event.data.object; // PaymentIntent object
          const { userId, items } = paymentIntent.metadata;

          if (!userId || !items) {
            console.warn('Missing metadata in payment intent');
            return { received: false };
          }

          const parsedItems = JSON.parse(items);

          const newOrder = {
            userId,
            items: parsedItems,
            paymentIntentId: paymentIntent.id,
            grandTotal: paymentIntent.amount / 100,
            discount: paymentIntent.metadata.discount,
            currency: paymentIntent.currency,
            buyername: paymentIntent.shipping.name,
            address: paymentIntent.shipping.address,
            status: 'succeeded',
            createdAt: new Date(),
          };

          console.log(newOrder, 'new orfder');

          const order = new this.orderMode(newOrder);
          await order.save();

          //this.mailTrapService.sendCheckOutEmail(paymentIntent.metadata.email);

          break;
        }
        case 'payment_intent.failed': {
          const failedPaymentIntent = event.data.object;
          console.log(`PaymentIntent failed: ${failedPaymentIntent.id}`);
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true, message: 'Order recived!' };
    } catch (err) {
      console.error('Webhook verification error:', err);
      throw new InternalServerErrorException(
        'Somthing went wrong on stripe side, your paymend did not go true. Try again later!',
      );
    }
  }
}
