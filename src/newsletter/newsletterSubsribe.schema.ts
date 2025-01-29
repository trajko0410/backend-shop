import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Date } from 'mongoose';

@Schema()
export class Newsletter {
  @Prop({
    required: true,
    type: String,
  })
  email: string;

  @Prop({
    required: false,
    type: String,
    default: Date.now,
  })
  createDate: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(Newsletter);
