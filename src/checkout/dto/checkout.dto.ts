import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
  IsInt,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for the Item field
export class ItemDto {
  @ApiProperty({
    description: 'Unique identifier for the item being purchased.',
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  itemID: string;

  @ApiProperty({
    description: 'Quantity of the item being purchased.',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Memory configuration for the item (e.g., 16GB). Optional.',
    example: '16GB',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  memory: string;
}

// Main CheckOut DTO
export class CheckOutDto {
  @ApiProperty({
    description: 'First name of the customer.',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Last name of the customer.',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  lastname: string;

  @ApiProperty({
    description: 'Email address of the customer.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Shipping address of the customer.',
    example: '1234 Elm Street',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  adress: string;

  @ApiProperty({
    description: 'City of the customer.',
    example: 'Springfield',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  city: string;

  @ApiProperty({
    description: 'Postal/ZIP code of the customer’s address.',
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  postalcode: number;

  @ApiProperty({
    description: 'Country of the customer.',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  country: string;

  @ApiProperty({
    description: 'List of items in the cart.',
    type: [ItemDto],
    example: [
      {
        itemID: 'abc123',
        amount: 2,
        memory: '16GB',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  item: ItemDto[];

  @ApiProperty({
    description: 'User ID (if applicable). Optional.',
    example: 'user123',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
