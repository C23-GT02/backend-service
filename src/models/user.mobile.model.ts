import { IsString } from 'class-validator';

export class editUserMobileModel {
  @IsString()
  uid: string;

  email: string | null;

  // password?: string | null;

  displayName?: string;

  photoURL?: string | any;
}
