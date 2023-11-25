import {
  IsEmail,
  IsMobilePhone,
  IsNumberString,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginUserModel {
  @IsEmail()
  @IsString()
  email: string;

  @MinLength(6)
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

// export class FinalUserModelWithRole {
//   @IsString()
//   uuid: string;

//   @IsString()
//   displayName: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   businessName: string;

//   @IsNumberString()
//   nib: string;

//   @IsMobilePhone()
//   telephone: string;

//   @IsString()
//   deskripsi: string;

//   @IsDateString()
//   timestamp?: string;
// }
