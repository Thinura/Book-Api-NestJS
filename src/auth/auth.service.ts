import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import {
  SigninAuthDto,
  SignupAuthDto,
} from './dto';
import { AuthResponse } from './interfaces/authResponse';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(
    signupAuthDto: SignupAuthDto,
  ): Promise<AuthResponse> {
    // TODO: Generate the password hash
    const hash = await argon.hash(
      signupAuthDto.password,
    );

    try {
      // TODO: Save the new user in the datasbase
      const user = await this.prisma.user.create({
        data: {
          email: signupAuthDto.email,
          hash,
        },
      });

      // TODO: Return the saved user token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(
    signinAuthDto: SigninAuthDto,
  ): Promise<AuthResponse> {
    // TODO: Find the user by email
    const user =
      await this.prisma.user.findUnique({
        where: { email: signinAuthDto.email },
      });

    // TODO: If the user does not exist throw exception
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    // TODO: Compare the password
    const pwMatches = await argon.verify(
      user.hash,
      signinAuthDto.password,
    );

    // TODO: If password incorrect throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    // TODO: Send back the user token
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<AuthResponse> {
    const payload = { sub: userId, email };

    const access_token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET_KEY'),
      },
    );
    return { access_token };
  }
}
