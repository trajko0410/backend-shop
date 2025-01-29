import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
//import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    /**
     * Inject jwtService
     */
    private readonly jwtService: JwtService,

    /**
     * Inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken(user: any, expiresIn: number) {
    console.log('env', process.env.JWT_SECRET, this.jwtConfiguration.secret);
    return await this.jwtService.signAsync(
      {
        sub: user._id,
        email: user.email,
        role: user.role,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  public async generateTokens(user: any) {
    //console.log(user, 'tokeng');

    const [accessToken, refreshToken] = await Promise.all([
      // Generate Access Token
      this.signToken(user, this.jwtConfiguration.accessTokenTtl),

      // Generate Refresh token without email
      this.signToken(user, this.jwtConfiguration.refreshTokenTtl),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
