import { IsString, IsUrl } from 'class-validator';

export class MemberModel {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  bio: string;

  @IsUrl()
  link: string;
}
