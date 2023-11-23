import { IsEmail } from 'class-validator';
import { Role } from './guard/roles.enum';

export class idCookie {
  idToken: string;

  uid: string;

  @IsEmail()
  email: string;

  role: Role;

  businessName: any;
}
