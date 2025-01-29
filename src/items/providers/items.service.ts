import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from '../item.schema';
import { Model } from 'mongoose';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';

import { CloudinaryHelper } from '../helper/helperfunctions';
import { PaginationHelper } from '../../common/pagination';

@Injectable()
export class ItemsService {
  //importing
  constructor(
    //importing database
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,

    //Importing deleteImageFromCloudinary function
    private readonly cloudinaryHelper: CloudinaryHelper,
  ) {}

  //FIND ALL ITEMS
  public async findAllItems(page: number, pageSize: number) {
    try {
      const items = await PaginationHelper.paginate(
        this.itemModel,
        page,
        pageSize,
      );
      return {
        items: items.items,
        paginationMeta: items.meta,
        message: 'All standard items fetched successfully',
        statusCode: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching items', {
        description:
          'An unexpected error occurred while fetching items from the database. Please try again later.',
      });
    }
  }

  //FINDING ALL ITEMS//
  public async findAllStandardItems(page: number, pageSize: number) {
    try {
      const items = await PaginationHelper.paginate(
        this.itemModel,
        page,
        pageSize,
      );
      return {
        items: items.items,
        paginationMeta: items.meta,
        message: 'All standard items fetched successfully',
        statusCode: 200,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching items', {
        description:
          'An unexpected error occurred while fetching items from the database. Please try again later.',
      });
    }
  }

  //FINDING ITEM BY ID AND THEN FINDING VARIANTS BY THERE NAME (FINDIG VARIANTS)//
  public async findItemById(id: string) {
    try {
      const item = await this.itemModel.findById(id);

      if (!item) {
        throw new BadRequestException(`Item with id of ${id} does not exist!`);
      }

      const relatedItems = await this.itemModel.find({ name: item.name });
      return {
        relatedItems,
        message: 'All variants fetched successfully',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        // Forward known BadRequestException directly
        throw error;
      }

      throw new InternalServerErrorException('Error fetching items', {
        description:
          'An unexpected error occurred while fetching items from the database. Please try again later.',
      });
    }
  }

  //CREATING ITEM//
  public async createNewItem(
    createItemDto: CreateItemDto,
    files: {
      mainPhoto?: Express.Multer.File[];
      colorPhotos?: Express.Multer.File[];
    },
  ) {
    // Handle main photo upload
    if (files.mainPhoto) {
      createItemDto.mainPhoto = [];

      try {
        // Loop through each file if multiple files are uploaded for mainPhoto
        for (const file of files.mainPhoto) {
          const mainPhotoUrl = await this.cloudinaryHelper.uploadImage(
            'items',
            file,
          );

          if ('url' in mainPhotoUrl) {
            createItemDto.mainPhoto.push(mainPhotoUrl.url); // Add each URL to the array
          } else {
            throw new BadRequestException('Failed to upload main photo');
          }
        }
      } catch (error) {
        //console.error('Error uploading main photo:', error);
        throw new InternalServerErrorException(
          'An error occurred while uploading main photo',
        );
      }
    }
    //console.log(files, 'photos');

    if (files.colorPhotos && files.colorPhotos.length) {
      try {
        createItemDto.colorPhotos = []; // Ensure that color array exists
        for (const file of files.colorPhotos) {
          console.log(file, 'ovo uplodujem');
          const uploadResult = await this.cloudinaryHelper.uploadImage(
            'items',
            file,
          );
          if ('url' in uploadResult) {
            createItemDto.colorPhotos.push(uploadResult.url);
          } else {
            throw new BadRequestException('Failed to upload color photo');
          }
        }
      } catch (error) {
        //console.error('Error uploading color photos:', error);
        throw new InternalServerErrorException(
          'An error occurred while uploading color photos',
        );
      }
    }

    //const { name, colorName, variant } = createItemDto;
    //console.log(variant, 'variantvalue');
    //const meta = `${name}-${colorName || 'default'}-${variant}`.toLowerCase();

    try {
      const item = new this.itemModel({ ...createItemDto });

      //console.log(item, 'createdto');
      //console.log(item, 'item');
      await item.save();

      return { item, message: 'Item created successfully!', statusCode: 201 };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while saving the item! Please try again later.',
      );
    }
  }

  //EDITING ITTEM//
  public async editItem(
    updateItemDto: UpdateItemDto,
    id: string,
    files: {
      mainPhoto?: Express.Multer.File[];
      colorPhotos?: Express.Multer.File[];
    },
    shoudlUpdateVariants: string | undefined,
  ) {
    let item: any;

    //getting item by id
    try {
      item = await this.itemModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Try again later.',
        { description: 'Error connecting to the database' },
      );
    }

    //checking if item exists
    if (!item) {
      throw new BadRequestException(`Item with ID ${id} does not exist.`);
    }

    // Store old URLs for deletion if needed
    const oldMainPhotoUrls = item.mainPhoto || [];
    const oldColorPhotoUrls = item.colorPhotos || [];
    //console.log(oldMainPhotoUrls, oldColorPhotoUrls, 'oldMainPhotoUrls');

    // Main photo upload
    if (files.mainPhoto) {
      updateItemDto.mainPhoto = [];
      try {
        // Loop through each file if multiple files are uploaded for mainPhoto
        for (const file of files.mainPhoto) {
          const mainPhotoUrl = await this.cloudinaryHelper.uploadImage(
            'items',
            file,
          );

          if ('url' in mainPhotoUrl) {
            updateItemDto.mainPhoto.push(mainPhotoUrl.url); // Add each URL to the array
          }
        }
      } catch (error) {
        //console.error('Error uploading main photo:', error);
        throw new InternalServerErrorException(
          'Failed to upload main photos. Please try again later.',
        );
      }
    } else if (updateItemDto.mainPhoto === undefined) {
      // Retain old URLs if no updates to mainPhoto
      updateItemDto.mainPhoto = item.mainPhoto;
    }

    //uploading color photos
    if (files.colorPhotos) {
      try {
        updateItemDto.colorPhotos = []; // Ensure that color array exists
        for (const file of files.colorPhotos) {
          //console.log(file, 'ovo uplodujem');
          const uploadResult = await this.cloudinaryHelper.uploadImage(
            'items',
            file,
          );
          if ('url' in uploadResult) {
            updateItemDto.colorPhotos.push(uploadResult.url);
          }
        }
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to upload color photos. Please try again later.',
        );
      }
    } else if (updateItemDto.colorPhotos === undefined) {
      // Retain old URLs if no updates to colorPhotos
      updateItemDto.colorPhotos = item.colorPhotos;
    }

    //console.log(shoudlUpdateVariants, 'updateVariants');

    //Check if name is updated
    const oldName = item.name;
    const isNameUpdated =
      updateItemDto.name && updateItemDto.name !== item.name;
    //console.log(isNameUpdated, 'iSnameupldated');

    //Dynamically update the current item
    Object.keys(updateItemDto).forEach((key) => {
      if (updateItemDto[key] !== undefined) {
        item[key] = updateItemDto[key];
      }
    });

    //save updated item to database
    try {
      await item.save();
    } catch (error) {
      //console.error('Error saving the updated item:', error);
      throw new InternalServerErrorException(
        'Failed to save the updated item. Please try again later.',
        { description: 'Database save operation failed' },
      );
    }

    //console.log(item, 'item save to database');

    // Check is nameUpdated and if variants should be updated and if yes save to database
    if (isNameUpdated && shoudlUpdateVariants === 'true') {
      try {
        // Find all items (variants) with the old name and update them
        const relatedItems = await this.itemModel.find({ name: oldName });
        for (const relatedItem of relatedItems) {
          if (relatedItem._id.toString() !== id) {
            relatedItem.name = updateItemDto.name; // Update the name of related variants
            await relatedItem.save();
          }
        }
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to update related variants. Please try again later.',
        );
      }
    }

    if (files.mainPhoto) {
      for (const url of oldMainPhotoUrls) {
        const publicId = this.cloudinaryHelper.extractPublicId(url);
        await this.cloudinaryHelper.deleteImageFromCloudinary(publicId);
      }
    }

    if (files.colorPhotos) {
      for (const url of oldColorPhotoUrls) {
        const publicId = this.cloudinaryHelper.extractPublicId(url);
        await this.cloudinaryHelper.deleteImageFromCloudinary(publicId);
      }
    }

    return {
      updatedItem: item,
      statusCode: 200,
      //oldMainPhotoUrls,
      //oldColorPhotoUrls,
      message: 'Item updated successfully',
    };
  }

  //DELETING ITEM//
  public async deleteItem(id: string, deleteVariants: string | undefined) {
    let item = undefined;

    try {
      item = await this.itemModel.find({ _id: id }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to process your request at the moment. Try again later.',
        { description: 'Error connecting to the database' },
      );
    }

    if (!item) {
      throw new BadRequestException('Item Id does not exist');
    }

    // Deduplicate photo URLs
    const allPhotoUrls = new Set<string>();
    const mainPhotoUrls = item[0].mainPhoto || [];
    const colorPhotoUrls = item[0].colorPhotos || [];
    mainPhotoUrls.forEach((url: string) => allPhotoUrls.add(url));
    colorPhotoUrls.forEach((url: string) => allPhotoUrls.add(url));

    //console.log(mainPhotoUrl, colorPhotoUrl, 'mainPhotoUrl, colorPhotoUrl');

    if (deleteVariants === 'true' && item[0].variant === 'standard') {
      try {
        const variants = await this.itemModel
          .find({ name: item[0].name })
          .exec();
        //console.log(variants, 'variants');
        //console.log(variants[0].name, 'variants length');

        if (!variants) {
          console.warn('No variants found for the item.');
        } else {
          for (const variant of variants) {
            const variantMainPhotoUrls = variant.mainPhoto || [];
            const variantColorPhotoUrls = variant.colorPhotos || [];

            variantMainPhotoUrls.forEach((url) => allPhotoUrls.add(url));
            variantColorPhotoUrls.forEach((url) => allPhotoUrls.add(url));

            // Delete the variant itself
            try {
              await variant.deleteOne();
              console.log(`Variant with ID ${variant._id} deleted.`);
            } catch (error) {
              console.error(
                `Failed to delete variant with ID ${variant._id}:`,
                error,
              );
            }
          }
        }
      } catch (error) {
        throw new InternalServerErrorException(
          'Error deleting variants. Please try again later.',
        );
      }
    }

    //console.log(allPhotoUrls, 'allPhotoUrls');

    for (const url of allPhotoUrls) {
      try {
        const publicId = this.cloudinaryHelper.extractPublicId(url);
        await this.cloudinaryHelper.deleteImageFromCloudinary(publicId);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error deleting images. Please try again later.',
        );
      }
    }

    try {
      await item[0].deleteOne();
      return {
        deleted: true,
        id,
        statusCode: 204,
        message: 'Item deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to delete the item. Try again later.',
        { description: 'Error deleting item from the database' },
      );
    }
  }
}
