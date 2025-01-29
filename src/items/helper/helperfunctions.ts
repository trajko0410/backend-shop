import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { Readable } from 'stream';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryHelper {
  private logger = new Logger('CloudinaryHelper');

  //DELETE IMAGE FROM CLOUDINARY//
  deleteImageFromCloudinary = async (publicId: string): Promise<string> => {
    if (!publicId) {
      throw new BadRequestException(
        'Public ID is required to delete an image.',
      );
    }

    try {
      const result = await v2.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(
          `Successfully deleted image with public ID: ${publicId}`,
        );
        return `Successfully deleted photo with public ID: ${publicId}`;
      } else if (result.result === 'not found') {
        this.logger.warn(
          `Image with public ID: ${publicId} was not found on Cloudinary.`,
        );
        throw new BadRequestException(
          `Image with public ID: ${publicId} was not found on Cloudinary.`,
        );
      } else {
        this.logger.error(
          `Failed to delete image with public ID: ${publicId}.`,
          result,
        );
        throw new InternalServerErrorException(
          `Failed to delete image with public ID: ${publicId}.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error deleting image with public ID: ${publicId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the image from Cloudinary.',
      );
    }
  };

  //EXTRACT PUBLIC ID FROM CLOUDINARY URL//
  public extractPublicId(url: string): string {
    const regex = /\/v\d+\/(.*?)\./; // Corrected regex for extracting public ID
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1]; // Extract and return public ID
    }
    throw new BadRequestException('Invalid Cloudinary URL');
  }

  //UPLOAD IMAGE TO CLOUDINARY//
  async uploadImage(
    folder: string,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    if (['image/jpg'].includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG and JPG are allowed.',
      );
    }

    if (file.size > 5 * 1034 * 1024) {
      throw new BadRequestException('File size exceeds the 5MB limit.');
    }

    //console.log(file.buffer, 'file uploadImage');

    // Upload to Cloudinary using `upload_stream`
    try {
      const result = new Promise((resolve, reject) => {
        const stream = v2.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        Readable.from(file.buffer).pipe(stream);
      });

      return result as Promise<UploadApiResponse | UploadApiErrorResponse>;
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`);
      throw new InternalServerErrorException(
        `Error uploading image: ${error.message}`,
      );
    }
  }
}
