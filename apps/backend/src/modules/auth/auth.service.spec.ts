import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('register', () => {
    it('should hash the password, create a user, and return a JWT token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const user = { id: '1', email };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      userRepository.createUser = jest.fn().mockResolvedValue(user);
      jwtService.sign = jest.fn().mockReturnValue('jwtToken');

      const result = await authService.register(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({ accessToken: 'jwtToken' });
    });
  });

  describe('login', () => {
    it('should validate the user and return a JWT token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: '1', email, password: 'hashedPassword123' };

      userRepository.findUserByEmail = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign = jest.fn().mockReturnValue('jwtToken');

      const result = await authService.login(email, password);

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({ accessToken: 'jwtToken' });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      userRepository.findUserByEmail = jest.fn().mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: '1', email, password: 'hashedPassword123' };

      userRepository.findUserByEmail = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });
});
