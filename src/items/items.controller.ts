import {
  Body,
  Controller,
  Patch,
  Post,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ItemsService } from './providers/items.service';
import { Get } from '@nestjs/common';
import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('items')
export class ItemsController {
  //imports
  constructor(
    //injection items services
    private readonly itemsService: ItemsService,
  ) {}

  @Roles('Admin', 'User', 'Public')
  @Get('all')
  public getAllItems(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 3,
  ) {
    return this.itemsService.findAllItems(page, pageSize);
  }

  //@UseGuards(UserPermissionGuard)
  @Roles('Admin', 'User', 'Public')
  @Get('standard')
  public getAllStandardItems(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 3,
  ) {
    return this.itemsService.findAllStandardItems(page, pageSize);
  }

  @Roles('Admin', 'User', 'Public')
  @Get(':id')
  public getItemById(@Param('id') id: string) {
    return this.itemsService.findItemById(id);
  }

  //@UseGuards(AccessTokenGuard)
  @Roles('Admin')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainPhoto', maxCount: 1 },
      { name: 'colorPhotos', maxCount: 5 },
    ]),
  )
  public createItem(
    @Body() createItemDto: CreateItemDto,
    @UploadedFiles()
    files: {
      mainPhoto: Express.Multer.File[];
      colorPhotos?: Express.Multer.File[];
    },
  ) {
    //console.log(files);
    //console.log(createItemDto);

    return this.itemsService.createNewItem(createItemDto, files);
  }

  @Roles('Admin')
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainPhoto', maxCount: 1 },
      { name: 'colorPhotos', maxCount: 5 },
    ]),
  )
  public editItem(
    @Body() updateItemDto: UpdateItemDto,
    @Param('id') id: string,
    @Query('updateVariants') updateVariants: string,
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      colorPhotos?: Express.Multer.File[];
    },
  ) {
    return this.itemsService.editItem(updateItemDto, id, files, updateVariants);
  }

  @Roles('Admin')
  @Delete(':id')
  public deleteItem(
    @Param('id') id: string,
    @Query('deleteVariants') deleteVariants: string,
  ) {
    return this.itemsService.deleteItem(id, deleteVariants);
  }
}
