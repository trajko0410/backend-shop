import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateRoleDto } from './dto/updateRole.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //GETALLUSERS//
  @Roles('Admin')
  @Get('allUsers')
  public async getAllUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    const allUsers = await this.usersService.findAllUsers(page, pageSize);
    return allUsers;
  }
  //GETALLUSERS//

  @Roles('Admin')
  @Get('search')
  public async searchUsers(@Query('email') email: string) {
    const users = await this.usersService.searchingByQuery(email);
    return users;
  }

  @Roles('Public')
  @Post('register')
  @UseInterceptors(AnyFilesInterceptor())
  public async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.registerUser(createUserDto);
  }

  @Roles('User', 'Admin')
  @Patch('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'avatar',
        maxCount: 1,
      },
    ]),
  )
  public async updateUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    updateUserDto: UpdateUserDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[] },
  ) {
    return this.usersService.updateUser(updateUserDto, files, id, req);
  }

  @Roles('Admin')
  @Delete('delete/:email')
  public deleteUser(@Param('email') email: string, @Req() req: any) {
    return this.usersService.deleteUser(email, req);
  }

  @Roles('Admin')
  @Patch('role/:id')
  @UseInterceptors(AnyFilesInterceptor())
  public async updatRole(
    @Param('id') id: string,
    @Body()
    updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(updateRoleDto, id);
  }
}
