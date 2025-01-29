import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum RoleEnum {
  Admin = 'Admin',
  User = 'User',
}

// Create an UpdateUserDto that includes only the 'role' field
export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role of the user. Default is "User".',
    example: 'User',
  })
  @IsEnum(RoleEnum)
  role: RoleEnum = RoleEnum.User;
}
