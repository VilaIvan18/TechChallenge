import { Module } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AccountModule, UserModule, AuthModule],
})
export class AppModule {}
