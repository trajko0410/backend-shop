import { Global, Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Global()
@Module({
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: () => {
        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.API_KEY,
          api_secret: process.env.API_SECRET,
        });
        return cloudinary;
      },
    },
  ],
  exports: ['CLOUDINARY'],
})
export class CloudinaryModule {}
