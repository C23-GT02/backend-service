import {
  IsEmail,
  IsMobilePhone,
  IsNumberString,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterModelMobile {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;
}

export class RegisterUserModel {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @MinLength(6)
  @IsString()
  password: string;

  @IsString()
  businessName: string;

  @IsNumberString()
  nib: string;

  @IsMobilePhone()
  telephone: string;

  @IsString()
  deskripsi?: string;

  logo?: string;
}
