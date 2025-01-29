import {
  BadRequestException,
  InternalServerErrorException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dto/signIn.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashingProvider } from './hashing.provider';

import { GenerateTokensProvider } from './generateToken.provider';
import { RefreshTokensProvider } from './refreshToken.privider';

@Injectable()
export class AuthService {
  constructor(
    //Injecting userservice from user module
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    //import hashing provider
    private readonly hasingProvider: HashingProvider,

    private readonly generateTokenProvider: GenerateTokensProvider,

    private readonly refreshTokenProvider: RefreshTokensProvider,
  ) {}

  public async refreshTokens(refreshToken: string) {
    return await this.refreshTokenProvider.refreshTokens(refreshToken);
  }

  public async signIn(signInDto: SignInDto) {
    let user = await this.usersService.findOneByEmail(signInDto.email);
    //will throw exeption if user is not found

    let isPasswordEqual: boolean = false;
    console.log(user);
    console.log(signInDto.password, user.passwordHash);

    try {
      isPasswordEqual = await this.hasingProvider.comparePassword(
        signInDto.password,
        user.passwordHash,
      );
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(`Somthing went wrong. ${error}`, {
        description: 'Could not compare passwords.',
      });
    }

    if (!isPasswordEqual) {
      throw new UnauthorizedException('Inserteed password is incorect.');
    }

    // Generate access token
    let tokens: { accessToken: string; refreshToken: string };
    try {
      tokens = await this.generateTokenProvider.generateTokens(user);
    } catch (error) {
      throw new InternalServerErrorException('Error generating access token', {
        description:
          'There was an error while generating the JWT access token.',
      });
    }

    return {
      tokens,
      userId: user.id,
      message: 'User logged-In.',
    };
  }
}
