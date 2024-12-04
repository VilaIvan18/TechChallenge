import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AccountCreateDto {
  @IsString()
  @IsNotEmpty()
  iban: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
