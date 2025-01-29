import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './createItem.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {}
