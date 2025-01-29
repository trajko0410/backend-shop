import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Date } from 'mongoose';

@Schema()
export class Addres {
  @Prop({
    required: true,
    type: String,
  })
  street: string;

  @Prop({
    required: true,
    type: String,
  })
  city: string;

  @Prop({
    required: true,
    type: String,
  })
  country: string;

  @Prop({
    required: true,
    type: String,
  })
  postalCode: string;
}

@Schema()
export class User {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
  })
  lastname: string;

  @Prop({
    required: true,
    type: String,
  })
  email: string;

  @Prop({
    required: true,
    type: String,
  })
  passwordHash: string;

  @Prop({
    required: true,
    type: String,
    enum: ['Admin', 'User'],
    default: 'User',
  })
  role: string;

  @Prop({
    required: false,
    type: Array,
  })
  avatar?: string[];

  @Prop({
    required: false,
    type: String,
    default: () => Date.now(),
  })
  createDate: Date;

  @Prop({
    required: false,
    type: [Addres],
  })
  address?: Addres[];
}

export const UserSchema = SchemaFactory.createForClass(User);
