import { IsDateString, IsEmail, IsNumber, IsString } from 'class-validator';

export class RateModel {
  @IsString()
  uid: string;
  @IsString()
  productRef: string;
  @IsString()
  partnerRef: string;
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsDateString()
  timestamp: string;
  @IsNumber()
  rating: number;
  @IsString()
  review: string;
}

export class RateFinal {
  uid: string;
  productRef: string;
  name: string;
  timestamp: string;
  rating: number;
  review: string;
}
