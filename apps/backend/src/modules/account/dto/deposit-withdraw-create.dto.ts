import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositWithdrawCreateDto {
  @IsString()
  @IsNotEmpty()
  iban: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
