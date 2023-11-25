import { IsString, IsNumberString } from 'class-validator';
export class createProductModel {
  @IsString()
  name: string;

  @IsString()
  deskripsi: string;

  images: string[];

  @IsNumberString()
  stock: any;

  @IsNumberString()
  harga: any;

  @IsString()
  tags: any;

  @IsString()
  material: string;

  @IsString()
  proses: string;

  @IsString()
  packaging: string;

  qrcodeURL?: any;
}
