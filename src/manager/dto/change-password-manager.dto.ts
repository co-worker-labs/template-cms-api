import { IsNotEmpty } from 'class-validator';

export class ChangePasswordManagerDto {
  @IsNotEmpty()
  password: string;
}
