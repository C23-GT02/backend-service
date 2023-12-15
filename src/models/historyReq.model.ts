import { IsEmail } from 'class-validator';

export class HistoryRequest {
  @IsEmail()
  email: string;
}
