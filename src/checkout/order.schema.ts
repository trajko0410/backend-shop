import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class itemsDetails {
  @Prop({ required: true, type: String })
  itemID: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, default: 'Base' })
  memory: string;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  totalPrice: number;
}

// Define the Order Schema
@Schema()
export class Order extends Document {
  @Prop({
    required: true,
    type: String,
  })
  userId: string; // Reference to the User model

  @Prop({
    type: [itemsDetails],
    required: true,
  })
  items: itemsDetails[]; // Array of items ordered

  @Prop({ required: true, type: String })
  paymentIntentId: string; // Payment Intent ID from Stripe

  @Prop({ required: true, type: Number })
  grandTotal: number; // Total amount for the order

  @Prop({ required: true, type: Number, default: 0 })
  discount: number; // Discount applied to the order

  @Prop({ required: true, type: String, default: 'usd' })
  currency: string; // Currency of the order (e.g., USD, EUR)

  @Prop({ required: true, type: String })
  buyername: string; // Name of the person placing the order

  @Prop({
    required: true,
    type: Object,
  })
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  }; // Address of the person

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'succeeded', 'shipped', 'delivered', 'canceled'],
    default: 'pending',
  })
  status: string; // Order status

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date; // Order creation timestamp
}

export const OrderSchema = SchemaFactory.createForClass(Order);
