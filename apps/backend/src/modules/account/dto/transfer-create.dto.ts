import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TransferCreateDto {
  @IsString()
  @IsNotEmpty()
  fromIban: string;

  @IsString()
  @IsNotEmpty()
  toIban: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
