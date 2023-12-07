import { IsString } from 'class-validator';

export class MemberModel {
  @IsString()
  name: string;

  role?: string;

  link?: string;

  bio?: string;

  image?: string | Buffer;
}
