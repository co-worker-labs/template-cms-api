import { IsNotEmpty } from 'class-validator';

export class SaveManagerDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
  role: number;
}
