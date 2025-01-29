import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

//Memory Schema
@Schema()
export class Memory {
  @Prop({ required: true, type: String })
  memory: string;

  @Prop({ required: true, type: String })
  price: number;
}

//Main Schema
@Schema()
export class Item extends Document {
  @Prop({
    required: true,
    type: String,
  })
  name: string;
  /*
  @Prop({
    required: true,
    type: String,
  })
  meta: string;*/

  @Prop({
    required: true,
    type: String,
  })
  shortDescription: string;

  @Prop({
    required: true,
    type: Number,
  })
  price: number;

  @Prop({
    required: true,
    type: String,
    enum: ['All', 'iPhone', 'iPod', 'iPad', 'Accessory', 'Mac'],
    default: 'All',
  })
  category: string;

  @Prop({
    required: true,
    type: Array,
  })
  mainPhoto: string[];

  @Prop({ required: true, type: Boolean })
  available: boolean;

  @Prop({ required: true, type: String })
  variant: string;

  @Prop({ required: false, type: String })
  description: string;

  @Prop({ type: [Memory], required: false })
  memory: Memory[];

  @Prop({ type: String, required: false })
  colorName: string;

  @Prop({ type: String, required: false })
  colorCode: string;

  @Prop({
    required: false,
    type: Array,
  })
  colorPhotos: string[];
}

export const ItemsSchema = SchemaFactory.createForClass(Item);
