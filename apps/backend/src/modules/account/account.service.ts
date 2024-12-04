import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { DepositWithdrawCreateDto } from './dto/deposit-withdraw-create.dto';
import { TransferCreateDto } from './dto/transfer-create.dto';
import { isValidIban } from '../../helpers/is-valid-iban.helper';
import { AccountCreateDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async createAccount(createAccountDto: AccountCreateDto) {
    const { iban, userId } = createAccountDto;

    if (!isValidIban(iban)) {
      throw new BadRequestException('Invalid IBAN');
    }

    const existingAccount =
      await this.accountRepository.findAccountByIban(iban);
    if (existingAccount) {
      throw new BadRequestException('An account with this IBAN already exists');
    }

    const newAccount = await this.accountRepository.createAccount({
      iban,
      userId,
    });

    return { success: true, account: newAccount };
  }

  async deposit(dto: DepositWithdrawCreateDto, userId: string) {
    const account = await this.accountRepository.findAccountByIban(dto.iban);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to deposit into this account',
      );
    }

    const newBalance = account.balance + dto.amount;

    await this.accountRepository.createTransaction({
      accountId: account.id,
      type: 'deposit',
      amount: dto.amount,
      balanceAfter: newBalance,
    });

    await this.accountRepository.updateAccountBalance(account.id, newBalance);

    return { success: true, newBalance };
  }

  async withdraw(dto: DepositWithdrawCreateDto, userId: string) {
    const account = await this.accountRepository.findAccountByIban(dto.iban);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to withdraw from this account',
      );
    }

    if (account.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = account.balance - dto.amount;

    await this.accountRepository.createTransaction({
      accountId: account.id,
      type: 'withdraw',
      amount: dto.amount,
      balanceAfter: newBalance,
    });

    await this.accountRepository.updateAccountBalance(account.id, newBalance);

    return { success: true, newBalance };
  }

  async transfer(dto: TransferCreateDto, userId: string) {
    if (dto.fromIban === dto.toIban) {
      throw new BadRequestException(
        'You cannot transfer money to the same IBAN',
      );
    }

    if (!isValidIban(dto.toIban)) {
      throw new BadRequestException('Invalid IBAN');
    }

    const senderAccount = await this.accountRepository.findAccountByIban(
      dto.fromIban,
    );

    if (!senderAccount) {
      throw new BadRequestException('Sender account not found');
    }

    if (senderAccount.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to transfer from this account',
      );
    }

    const recipientAccount = await this.accountRepository.findAccountByIban(
      dto.toIban,
    );

    if (!recipientAccount) {
      throw new BadRequestException('Recipient account not found');
    }

    if (senderAccount.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const senderUpdatedBalance = senderAccount.balance - dto.amount;
    const recipientUpdatedBalance = recipientAccount.balance + dto.amount;

    await this.accountRepository.createTransaction({
      accountId: senderAccount.id,
      type: 'transfer',
      amount: dto.amount,
      balanceAfter: senderUpdatedBalance,
      senderIban: senderAccount.iban,
      recipientIban: dto.toIban,
    });

    await this.accountRepository.createTransaction({
      accountId: recipientAccount.id,
      type: 'transfer',
      amount: dto.amount,
      balanceAfter: recipientUpdatedBalance,
      senderIban: senderAccount.iban,
      recipientIban: recipientAccount.iban,
    });

    await this.accountRepository.updateAccountBalance(
      senderAccount.id,
      senderUpdatedBalance,
    );
    await this.accountRepository.updateAccountBalance(
      recipientAccount.id,
      recipientUpdatedBalance,
    );

    return { success: true, senderUpdatedBalance, recipientUpdatedBalance };
  }

  async getAccountStatement(userId: string, iban: string) {
    const account = await this.accountRepository.findAccountByIban(iban);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to view this account',
      );
    }

    const transactions =
      await this.accountRepository.findTransactionsByAccountId(account.id);

    return {
      iban: account.iban,
      balance: account.balance,
      transactions: transactions.map((transaction: any) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        balanceAfter: transaction.balanceAfter,
        createdAt: transaction.createdAt,
        senderIban: transaction.senderIban,
        recipientIban: transaction.recipientIban,
      })),
    };
  }

  async getAllUserAccounts(userId: string) {
    const accounts = await this.accountRepository.findAccountsByUserId(userId);

    return accounts.map((account) => ({
      id: account.id,
      iban: account.iban,
      balance: account.balance,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }
}
