import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { isValidIban } from '../../helpers/is-valid-iban.helper';

jest.mock('../../helpers/is-valid-iban.helper');

const testAccount = {
  id: '1',
  iban: 'iban1',
  balance: 1,
  userId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            findAccountByIban: jest.fn(),
            findAccountsByUserId: jest.fn(),
            createAccount: jest.fn(),
            createTransaction: jest.fn(),
            updateAccountBalance: jest.fn(),
            findTransactionsByAccountId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get(AccountRepository);
  });

  describe('createAccount', () => {
    it('should throw if IBAN is invalid', async () => {
      (isValidIban as jest.Mock).mockReturnValue(false);

      await expect(
        service.createAccount({ iban: 'invalid-iban', userId: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if account with IBAN already exists', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      await expect(
        service.createAccount({ iban: 'valid-iban', userId: 'user1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new account if IBAN is valid and unique', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban.mockResolvedValue(null);
      accountRepository.createAccount.mockResolvedValue(testAccount);

      const result = await service.createAccount({
        iban: 'valid-iban',
        userId: 'user1',
      });

      expect(result.success).toEqual(true);
      expect(result.account.id).toEqual('1');
    });
  });

  describe('deposit', () => {
    it('should throw if account does not exist', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(null);

      await expect(
        service.deposit({ iban: 'iban1', amount: 100 }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user does not own the account', async () => {
      accountRepository.findAccountByIban.mockResolvedValue({
        id: '1',
        iban: '1',
        balance: 1,
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.deposit({ iban: 'iban1', amount: 100 }, 'user1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should deposit and update balance if valid', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      const result = await service.deposit({ iban: 'iban1', amount: 100 }, '1');

      expect(accountRepository.createTransaction).toHaveBeenCalledWith({
        accountId: '1',
        type: 'deposit',
        amount: 100,
        balanceAfter: 101,
      });
      expect(accountRepository.updateAccountBalance).toHaveBeenCalledWith(
        '1',
        101,
      );
      expect(result).toEqual({ success: true, newBalance: 101 });
    });
  });

  describe('withdraw', () => {
    it('should throw if account does not exist', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(null);

      await expect(
        service.withdraw({ iban: 'iban1', amount: 100 }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user does not own the account', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      await expect(
        service.withdraw({ iban: 'iban1', amount: 100 }, 'user1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if balance is insufficient', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      await expect(
        service.withdraw({ iban: 'iban1', amount: 100 }, '1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should withdraw and update balance if valid', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      const result = await service.withdraw({ iban: 'iban1', amount: 1 }, '1');

      expect(accountRepository.createTransaction).toHaveBeenCalledWith({
        accountId: '1',
        type: 'withdraw',
        amount: 1,
        balanceAfter: 0,
      });
      expect(accountRepository.updateAccountBalance).toHaveBeenCalledWith(
        '1',
        0,
      );
      expect(result).toEqual({ success: true, newBalance: 0 });
    });
  });

  describe('transfer', () => {
    it('should throw if the fromIban is the same as toIban', async () => {
      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'iban1', amount: 100 },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if toIban is invalid', async () => {
      (isValidIban as jest.Mock).mockReturnValue(false);

      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'invalid-iban', amount: 100 },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if sender account does not exist', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban.mockResolvedValueOnce(null);

      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'iban2', amount: 100 },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user does not own the sender account', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban.mockResolvedValueOnce(testAccount);

      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'iban2', amount: 100 },
          'user1',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if recipient account does not exist', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban
        .mockResolvedValueOnce(testAccount)
        .mockResolvedValueOnce(null);

      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'iban2', amount: 100 },
          '1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if sender account has insufficient balance', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban.mockResolvedValueOnce(testAccount);

      await expect(
        service.transfer(
          { fromIban: 'iban1', toIban: 'iban2', amount: 100 },
          '1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should perform transfer and update balances if valid', async () => {
      (isValidIban as jest.Mock).mockReturnValue(true);
      accountRepository.findAccountByIban
        .mockResolvedValueOnce({
          id: '1',
          userId: 'user1',
          balance: 500,
          iban: 'iban1',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: '2',
          userId: 'user2',
          balance: 200,
          iban: 'iban2',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.transfer(
        { fromIban: 'iban1', toIban: 'iban2', amount: 100 },
        'user1',
      );

      expect(accountRepository.createTransaction).toHaveBeenCalledWith({
        accountId: '1',
        type: 'transfer sent',
        amount: 100,
        balanceAfter: 400,
        senderIban: 'iban1',
        recipientIban: 'iban2',
      });
      expect(accountRepository.createTransaction).toHaveBeenCalledWith({
        accountId: '2',
        type: 'transfer received',
        amount: 100,
        balanceAfter: 300,
        senderIban: 'iban1',
        recipientIban: 'iban2',
      });
      expect(accountRepository.updateAccountBalance).toHaveBeenCalledWith(
        '1',
        400,
      );
      expect(accountRepository.updateAccountBalance).toHaveBeenCalledWith(
        '2',
        300,
      );
      expect(result).toEqual({
        success: true,
        senderUpdatedBalance: 400,
        recipientUpdatedBalance: 300,
      });
    });
  });

  describe('getAccountStatement', () => {
    it('should throw if account does not exist', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(null);

      await expect(
        service.getAccountStatement('user1', 'iban1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user does not own the account', async () => {
      accountRepository.findAccountByIban.mockResolvedValue(testAccount);

      await expect(
        service.getAccountStatement('user1', 'iban1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return account statement with transactions if valid', async () => {
      accountRepository.findAccountByIban.mockResolvedValue({
        id: '1',
        iban: 'iban1',
        balance: 500,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      accountRepository.findTransactionsByAccountId.mockResolvedValue([
        {
          id: 'tx1',
          type: 'deposit',
          amount: 100,
          balanceAfter: 500,
          createdAt: new Date(),
          senderIban: null,
          recipientIban: null,
          accountId: '1',
        },
      ]);

      const result = await service.getAccountStatement('user1', 'iban1');

      expect(result).toEqual({
        iban: 'iban1',
        balance: 500,
        transactions: [
          {
            id: 'tx1',
            type: 'deposit',
            amount: 100,
            balanceAfter: 500,
            createdAt: expect.any(Date),
            senderIban: null,
            recipientIban: null,
          },
        ],
      });
    });
  });

  describe('getAllUserAccounts', () => {
    it('should return all accounts owned by the user', async () => {
      accountRepository.findAccountsByUserId.mockResolvedValue([
        {
          id: '1',
          iban: 'iban1',
          balance: 500,
          userId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const result = await service.getAllUserAccounts('user1');
      expect(result).toEqual([
        {
          id: '1',
          iban: 'iban1',
          balance: 500,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
