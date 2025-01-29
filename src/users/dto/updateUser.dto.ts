import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({
    description: 'Street address of the user',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'City of the user',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Country of the user',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Postal code of the user',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

// Update User DTO
export class UpdateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  lastname: string;

  @ApiPropertyOptional({
    description: 'List of addresses for the user.',
    type: [AddressDto],
    example: [
      {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @Type(() => AddressDto)
  address?: AddressDto[];

  @ApiPropertyOptional({
    description: 'Avatar image for the user.',
    example: ['avatar1.jpg'],
  })
  @IsOptional()
  @IsString()
  avatar?: string[];
}
