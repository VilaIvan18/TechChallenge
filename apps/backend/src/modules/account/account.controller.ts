import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { DepositWithdrawCreateDto } from './dto/deposit-withdraw-create.dto';
import { TransferCreateDto } from './dto/transfer-create.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountCreateDto } from './dto/create-account.dto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  async createAccount(
    @Body() accountCreateDto: AccountCreateDto,
    @Request() req: any,
  ) {
    accountCreateDto.userId = req.user.id;

    return this.accountService.createAccount(accountCreateDto);
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositWithdrawCreateDto, @Request() req: any) {
    return this.accountService.deposit(dto, req.user.userId);
  }

  @Post('withdraw')
  async withdraw(@Body() dto: DepositWithdrawCreateDto, @Request() req: any) {
    return this.accountService.withdraw(dto, req.user.userId);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferCreateDto, @Request() req: any) {
    return this.accountService.transfer(dto, req.user.userId);
  }

  @Get('statement')
  async getStatement(@Body('iban') iban: string, @Request() req: any) {
    return this.accountService.getAccountStatement(req.user.userId, iban);
  }
}
