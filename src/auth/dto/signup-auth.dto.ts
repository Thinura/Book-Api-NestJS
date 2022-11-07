import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class SignupAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
