import { IsString, IsNumberString } from 'class-validator';
export class createProductModel {
  @IsString()
  name: string;

  @IsString()
  deskripsi: string;

  images: string[];

  @IsNumberString()
  stock;

  @IsNumberString()
  harga;

  tags: any;

  @IsString()
  material: string;

  @IsString()
  proses: string;

  @IsString()
  packaging: string;
}
