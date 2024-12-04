import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';

@Module({})
export class AccountModule {
  controllers: [AccountController];
}
