import { IsCurrency, IsInt, IsString, IsUrl } from 'class-validator';

export class createProductModel {
  @IsString()
  name: string;

  @IsString()
  deskripsi: string;

  @IsUrl()
  image: string;

  @IsInt()
  stock: number;

  @IsCurrency()
  harga: string;

  @IsString()
  tags: string;

  @IsString()
  material: string;

  @IsString()
  proses: string;

  @IsString()
  packaging: string;
}
