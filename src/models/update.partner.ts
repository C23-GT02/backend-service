import {
  IsEmail,
  IsMobilePhone,
  IsNumberString,
  IsString,
  IsUrl,
} from 'class-validator';

export class updatePartner {
  @IsEmail()
  email: string;

  @IsNumberString()
  nib: string;

  @IsMobilePhone()
  telephone: string;

  @IsUrl()
  olshopUrl: string;

  @IsString()
  deskripsi: string;
}
