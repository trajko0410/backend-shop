import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/createUser.dto';
import { forwardRef, Inject } from '@nestjs/common';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { CloudinaryHelper } from 'src/items/helper/helperfunctions';
import { UpdateRoleDto } from '../dto/updateRole.dto';
import { PaginationHelper } from 'src/common/pagination';

@Injectable()
export class UsersService {
  constructor(
    //importing database
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    //@Inject(forwardRef(() => CloudinaryHelper))
    private readonly cloudinaryHelper: CloudinaryHelper,

    /**
     * Inject BCrypt Provider
     */
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  //FIND ALL USERS
  public async findAllUsers(page: number = 1, pageSize: number = 2) {
    try {
      if (page && pageSize) {
        // If pagination parameters exist, use the PaginationHelper to paginate the result
        const result = await PaginationHelper.paginate(
          this.userModel,
          page,
          pageSize,
        );
        return {
          users: result.items, // Access paginated users
          meta: result.meta, // Pagination metadata
          message: 'Users fetched successfully with pagination',
          statusCode: 200,
        };
      } else {
        // If no pagination parameters are provided, return all users
        const users = await this.userModel.find().select('-passwordHash'); // Apply any filters passed (if any)
        return {
          users,
          message: 'All users fetched successfully',
          statusCode: 200,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException('Error fetching items', {
        description:
          'An unexpected error occurred while fetching users from the database. Please try again later.',
      });
    }
  }

  //GET ONE USER BY EMAIL
  public async searchingByQuery(email: string) {
    if (!email)
      return {
        message: 'Email parameter is required.',
        statusCode: 400,
      };

    try {
      const users = await this.userModel.find({
        email: { $regex: email, $options: 'i' }, // Case-insensitive match
      });

      if (users.length === 0) {
        return {
          message: 'No users found with the provided email address.',
          statusCode: 404, // Not Found when no users match
        };
      }

      return { users, status: 200, message: 'User found successfully' };
    } catch (error) {
      //console.error('Error querying users by email:', error);
      throw new InternalServerErrorException(
        'Failed to search for users. Please try again later.',
      );
    }
  }

  //REGISTER USER
  public async registerUser(createUserDto: CreateUserDto) {
    let existingUser = undefined;

    try {
      existingUser = await this.userModel
        .findOne({
          email: createUserDto.email,
        })
        .exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try again later',
        {
          description: 'Error connecting to the database.',
        },
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'The user with this email already exists, plese try again with diffrent email.',
      );
    }

    if (createUserDto.password !== createUserDto.repeatpassword) {
      throw new BadRequestException('Password and repeat password must match.');
    }

    let hashedPassword = undefined;
    try {
      hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error saving password', {
        description: 'An unexpected error occurred while hashing password.',
      });
    }

    try {
      const createUser = new this.userModel({
        ...createUserDto,
        role: 'User',
        passwordHash: hashedPassword,
      });

      await createUser.save();
      return {
        createUser: {
          name: createUser.name,
          lastname: createUser.lastname,
          email: createUser.email,
          role: createUser.role,
        },
        message: 'User Created',
        statusCode: 200,
      };
    } catch (error) {
      //console.log(error);
      throw new InternalServerErrorException('Error saving user to database.', {
        description:
          'An unexpected error occurred while saving user to the database. Please try again later.',
      });
    }
  }

  //FIND ONE USER
  public async findOneByEmail(email: String) {
    let user = undefined;
    try {
      user = await this.userModel.findOne({ email: email }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error connecting to database.', {
        description:
          'An unexpected error occurred while connecting to the database. Please try again later.',
      });
    }

    if (!user) {
      throw new BadRequestException('User does not exist in database');
    }

    return user;
  }

  //UPDATE USER
  public async updateUser(
    updateUserDto: UpdateUserDto,
    files: { avatar?: Express.Multer.File[] },
    id: string,
    req: any,
  ) {
    const requestUser = req.user.sub;

    if (requestUser.sub === id) {
      throw new ForbiddenException('You can only update your account');
    }
    // console.log(id);
    let user = undefined;
    try {
      user = await this.userModel.findById(id).exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Try again later.',
        { description: 'Error connecting to the database' },
      );
    }
    //console.log(user, 'ss');
    if (!user) {
      throw new BadRequestException(`User with ID ${id} does not exist.`);
    }

    const oldAvatar = user.avatar || undefined;

    if (files.avatar) {
      updateUserDto.avatar = [];
      try {
        // Loop through each file if multiple files are uploaded for mainPhoto
        for (const file of files.avatar) {
          const avatarUrl = await this.cloudinaryHelper.uploadImage(
            'avatars',
            file,
          );

          if ('url' in avatarUrl) {
            updateUserDto.avatar.push(avatarUrl.url); // Add each URL to the array
          }
        }
      } catch (error) {
        //console.error('Error uploading main photo:', error);
        throw new InternalServerErrorException(
          'Failed to upload main photos. Please try again later.',
        );
      }
    } else if (updateUserDto.avatar === undefined) {
      // Retain old URLs if no updates to mainPhoto
      updateUserDto.avatar = user.avatar;
    }

    Object.keys(updateUserDto).forEach((key) => {
      if (updateUserDto[key] !== undefined) {
        user[key] = updateUserDto[key];
      }
    });

    try {
      await user.save();
    } catch (error) {
      // console.error('Error saving the updated item:', error);
      throw new InternalServerErrorException(
        'Failed to save updated user. Please try again later.',
        { description: 'Database save operation failed' },
      );
    }
    // console.log(oldAvatar);
    if (files.avatar && oldAvatar) {
      for (const url of oldAvatar) {
        const publicId = this.cloudinaryHelper.extractPublicId(url);
        await this.cloudinaryHelper.deleteImageFromCloudinary(publicId);
        //console.log('Deleted');
      }
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash; // Exclude password hash from the response

    return {
      updatedUser: userResponse,
      statusCode: 200,
      //oldMainPhotoUrls,
      //oldColorPhotoUrls,
      message: 'User updated successfully',
    };
  }

  //DELETE USER
  public async deleteUser(email: string, req: any) {
    let user = undefined;

    try {
      user = await this.userModel.find({ email: email }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to process your request at the moment. Try again later.',
        { description: 'Error connecting to the database' },
      );
    }

    if (!user) {
      throw new BadRequestException('User email does not exist.');
    }

    //console.log(user[0].avatar);

    if (user[0].avatar) {
      console.log('Deleting user and user image');
      try {
        const publicId = this.cloudinaryHelper.extractPublicId(
          user[0].avatar[0],
        );
        await this.cloudinaryHelper.deleteImageFromCloudinary(publicId);
        //console.log(publicId, "delete");
      } catch (error) {
        throw new InternalServerErrorException(
          'Error deleting images. Please try again later.',
        );
      }
    }

    try {
      await user[0].deleteOne();
      return {
        deleted: true,
        statusCode: 204,
        message: `User with email:${email} deleted successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to delete the user. Try again later.',
        { description: 'Error deleting user from the database' },
      );
    }
  }

  //UPDATE ROLE
  public async updateRole(updateRoleDto: UpdateRoleDto, id: string) {
    let user = undefined;
    try {
      user = await this.userModel.findById(id).exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Try again later.',
        { description: 'Error connecting to the database' },
      );
    }
    //console.log(user, 'ss');
    if (!user) {
      throw new BadRequestException(`User with ID ${id} does not exist.`);
    }

    try {
      user.role = updateRoleDto.role; // Assuming UpdateRoleDto has a 'role' field
      await user.save(); // Save the updated user
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update the user role. Please try again later.',
        { description: 'Error saving updated role to database' },
      );
    }

    return {
      message: `User role updated successfully.`,
      updatedUser: { userId: user.id, userRole: user.role },
      statusCode: 200,
    };
  }
}
