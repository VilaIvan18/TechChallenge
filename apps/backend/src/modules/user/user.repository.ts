import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { email: string; password: string }) {
    return this.prisma.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createAccount(userId: string, iban: string) {
    return this.prisma.account.create({
      data: { userId, iban },
    });
  }

  async findUserAccounts(userId: string) {
    return this.prisma.account.findMany({ where: { userId } });
  }
}
