import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAccountByIban(iban: string) {
    return this.prisma.account.findUnique({
      where: { iban },
    });
  }

  async updateAccountBalance(accountId: string, balance: number) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: { balance },
    });
  }

  async createTransaction(data: {
    accountId: string;
    type: string;
    amount: number;
    balanceAfter: number;
    recipientIban?: string;
    senderIban?: string;
  }) {
    return this.prisma.transaction.create({
      data,
    });
  }

  async findTransactionsByAccountId(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAccount({ iban, userId }: { iban: string; userId: string }) {
    return this.prisma.account.create({
      data: {
        iban,
        userId,
        balance: 0,
      },
    });
  }

  async findAccountsByUserId(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
