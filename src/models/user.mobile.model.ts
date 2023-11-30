import { IsEmail, IsString } from 'class-validator';

export class editUserMobileModel {
  @IsString()
  uid: string;

  @IsEmail()
  email: string | null;

  displayName?: string;

  photoURL?: string | any;

  phoneNumber?: string;
}
