import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { DepositWithdrawCreateDto } from './dto/deposit-withdraw-create.dto';
import { TransferCreateDto } from './dto/transfer-create.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountCreateDto } from './dto/create-account.dto';

@Controller('/account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('/create')
  async createAccount(
    @Body() accountCreateDto: AccountCreateDto,
    @Request() req: any,
  ) {
    accountCreateDto.userId = req.user.id;

    return this.accountService.createAccount(accountCreateDto);
  }

  @Get('/')
  async getAllUserAccounts(@Request() req: any) {
    const userId = req.user.id;
    return this.accountService.getAllUserAccounts(userId);
  }

  @Post('/deposit')
  async deposit(@Body() dto: DepositWithdrawCreateDto, @Request() req: any) {
    return this.accountService.deposit(dto, req.user.id);
  }

  @Post('/withdraw')
  async withdraw(@Body() dto: DepositWithdrawCreateDto, @Request() req: any) {
    return this.accountService.withdraw(dto, req.user.id);
  }

  @Post('/transfer')
  async transfer(@Body() dto: TransferCreateDto, @Request() req: any) {
    return this.accountService.transfer(dto, req.user.id);
  }

  @Get('/statement')
  async getStatement(@Query('iban') iban: string, @Request() req: any) {
    return this.accountService.getAccountStatement(req.user.id, iban);
  }
}
