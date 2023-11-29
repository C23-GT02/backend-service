import {
  IsEmail,
  IsMobilePhone,
  IsNumberString,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterModelMobile {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
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
