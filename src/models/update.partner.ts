import { IsEmail, IsMobilePhone, IsNumberString, IsUrl } from 'class-validator';

export class updatePartner {
  @IsEmail()
  email: string;

  @IsNumberString()
  nib: string;

  @IsMobilePhone()
  telephone: string;

  @IsUrl()
  olshopUrl: string;
}
