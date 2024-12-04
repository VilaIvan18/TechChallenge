import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
    });
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  private generateToken(user: { id: string; email: string }) {
    return {
      accessToken: this.jwtService.sign({ userId: user.id, email: user.email }),
    };
  }
}
