import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // GET : /users/me
  // @UseGuards(JwtGuard)
  @Get('me')
  getMe(
    @GetUser() user: User,
    // @GetUser('email') userEmail: string,
  ) {
    // console.log(userEmail);
    return user;
  }

  // PATCH : /users/{id}
  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }
}
