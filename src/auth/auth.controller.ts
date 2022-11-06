import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninAuthDto, SignupAuthDto } from './dto';
import { AuthResponse } from './interfaces/authResponse';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST - auth/signup
  @Post('signup')
  signup(@Body() signupAuthDto: SignupAuthDto): Promise<AuthResponse> {
    return this.authService.signup(signupAuthDto);
  }

  // POST - auth/signin
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() signinAuthDto: SigninAuthDto): Promise<AuthResponse> {
    return this.authService.signin(signinAuthDto);
  }
}
