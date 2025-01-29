import { Item, ItemsSchema } from './item.schema';

import { Module } from '@nestjs/common';
import { ItemsService } from './providers/items.service';
import { ItemsController } from './items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryHelper } from './helper/helperfunctions';

@Module({
  providers: [ItemsService, CloudinaryHelper],
  controllers: [ItemsController],
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemsSchema }]),
  ],
  exports: [CloudinaryHelper],
})
export class ItemsModule {}
