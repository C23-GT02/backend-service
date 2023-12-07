import { IsEmail, IsString, IsIn } from 'class-validator';

export class ApproverDTO {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsIn(['admin', 'approver', 'partner', 'User'])
  role: string;
}
