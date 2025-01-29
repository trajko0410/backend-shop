import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ('Admin' | 'User' | 'Public')[]) =>
  SetMetadata('roles', roles);
