import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable, retry } from 'rxjs';
import jwtConfig from 'src/auth/config/jwt.config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Console } from 'console';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    //jwt servise to check if forwardet jwt is corect and to extract values from it
    private readonly jwtService: JwtService,

    //our jwt setup
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler()); //gets roles from decorator
    const request = context.switchToHttp().getRequest();

    // If no roles are specified, allow public access
    if (!roles) return true;

    const token = this.extractTokenFromHeader(request);
    //console.log(token, 'extracted token guard');

    if (!token) {
      if (roles.includes('Public')) {
        return true;
      } else {
        throw new UnauthorizedException('No token provided');
      }
    }
    //console.log(roles, 'roles passed');
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      //console.log(payload);
      request['user'] = payload; //on request this will be sent with it payload here
      // Check if the user's role matches the allowed roles

      const normalizedRoles = roles.map((role) => role.toLowerCase());
      const userRole = payload.role?.toLowerCase();

      if (normalizedRoles.includes(userRole)) {
        return true; // Access granted
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
