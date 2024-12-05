import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() dto: UserDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('/login')
  login(@Body() dto: UserDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
