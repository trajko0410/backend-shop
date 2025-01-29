import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';

interface PaginationResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    curentPage: number;
    pageSize: number;
  };
}

export class PaginationHelper {
  static async paginate<T>(
    model: Model<T>,
    page: number,
    pageSize: number,
    query: Record<string, any> = {},
  ) {
    const totalItems = await model.countDocuments(query);
    console.log(totalItems, 'totalItems');
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const skip = (currentPage - 1) * pageSize;

    try {
      const items = await model.find(query).skip(skip).limit(pageSize);
      return {
        items,
        meta: {
          totalItems,
          totalPages,
          currentPage,
          pageSize,
        },
      };
    } catch (error) {
      throw new BadRequestException('Error during pagination');
    }
  }
}
