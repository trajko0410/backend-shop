import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  Min,
  MinLength,
  MaxLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum ItemCategoryEnum {
  All = 'All',
  iPhone = 'iPhone',
  iPod = 'iPod',
  iPad = 'iPad',
  Accessorie = 'Accessorie',
  Mac = 'Mac',
}

enum VariantEnum {
  variant = 'variant',
  standard = 'standard',
}

export class MemoryDto {
  @ApiProperty({
    description: 'The memory size or type (e.g., "128GB", "256GB")',
    example: '128GB',
  })
  @IsString()
  @IsNotEmpty()
  memory: string;

  @ApiProperty({
    description: 'The price for the memory option',
    example: 100,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  price: number;
}

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'iPhone 13',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: "The name of the item's color (optional)",
    example: 'Red',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  colorName?: string;

  @ApiProperty({
    description: 'The color code of the item (optional)',
    example: '#FF0000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  colorCode?: string;

  @ApiProperty({
    description: 'A list of color photos (optional)',
    type: [String],
    required: false,
    example: [
      'https://example.com/red.jpg',
      'https://example.com/red_back.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  colorPhotos?: string[];

  @ApiProperty({
    description: 'A short description of the item',
    example: 'Latest iPhone model',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({
    description: 'The price of the item',
    example: 999,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'The category of the item',
    enum: ItemCategoryEnum,
    example: 'iPhone',
  })
  @IsEnum(ItemCategoryEnum)
  category: ItemCategoryEnum;

  @ApiProperty({
    description: 'Main photo of the item (required)',
    type: 'string',
    format: 'binary',
  })
  @Type(() => Object)
  mainPhoto: Express.Multer.File[];

  @ApiProperty({
    description: 'Whether the item is available for sale',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  available: boolean;

  @ApiProperty({
    description: 'The variant of the item',
    enum: VariantEnum,
    example: 'standard',
  })
  @IsEnum(VariantEnum)
  @IsNotEmpty()
  variant: VariantEnum;

  @ApiProperty({
    description: 'A detailed description of the item (optional)',
    example: 'The latest iPhone 13 with 5G capabilities.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;

  @ApiProperty({
    description: 'Memory options for the item (optional)',
    type: [MemoryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => MemoryDto)
  memory?: MemoryDto[];
}
