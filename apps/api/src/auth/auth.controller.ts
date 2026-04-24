import {
  Controller, Post, Get, Body, Res, Req,
  HttpCode, HttpStatus, UseGuards, Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
};


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }



  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, ip);
    const { _refreshToken } = result.tokens as typeof result.tokens & { _refreshToken?: string };
    if (_refreshToken) res.cookie('refresh_token', _refreshToken, COOKIE_OPTIONS);
    return { success: true, data: { user: result.user, tokens: { accessToken: result.tokens.accessToken, expiresIn: result.tokens.expiresIn } } };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string>;
    const refreshToken = cookies['refresh_token'];
    if (!refreshToken) {
      return { success: false, error: { code: 'TOKEN_INVALID', message: 'No refresh token provided' } };
    }
    // Decode to get userId without verifying (verify happens in service)
    const payload = JSON.parse(Buffer.from(refreshToken.split('.')[1]!, 'base64').toString()) as { sub: string };
    const tokens = await this.authService.refresh(payload.sub, refreshToken);
    const { _refreshToken } = tokens as typeof tokens & { _refreshToken?: string };
    if (_refreshToken) res.cookie('refresh_token', _refreshToken, COOKIE_OPTIONS);
    return { success: true, data: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  
  
  async logout(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    return { success: true, data: null };
  }

  @Get('me')
  
  
  async getMe(@CurrentUser() user: RequestUser) {
    const data = await this.authService.getMe(user.id);
    return { success: true, data };
  }

  @Public()
  @Get('verify-email')
  
  async verifyEmail(@Req() req: Request) {
    const { token } = req.query as { token: string };
    await this.authService.verifyEmail(token);
    return { success: true, data: { message: 'Email verified successfully' } };
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { success: true, data: { message: 'If that email exists, a reset link has been sent' } };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { success: true, data: { message: 'Password reset successfully' } };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  
  
  async changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.id, dto);
    return { success: true, data: { message: 'Password changed successfully' } };
  }
}
