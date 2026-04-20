import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import type { IJwtPayload, IAuthTokens, IUser } from '@ems/shared';
import { UserRole, Department } from '@ems/shared';

const BCRYPT_ROUNDS = 12;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly auditLog: AuditLogService,
  ) {}

  async register(dto: RegisterDto, ip?: string): Promise<{ user: IUser; tokens: IAuthTokens }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException({ code: 'ALREADY_EXISTS', message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const emailVerifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? 'EMPLOYEE',
        department: dto.department,
        status: 'PENDING',
        emailVerifyToken,
      },
    });

    // In prod: send verification email. In dev: log token.
    this.logger.log(`[DEV] Email verify token for ${user.email}: ${emailVerifyToken}`);

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens);

    await this.auditLog.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'users',
      entityId: user.id,
      newValues: { email: user.email, role: user.role },
      ipAddress: ip,
    });

    return { user: this.sanitize(user), tokens };
  }

  async login(dto: LoginDto, ip?: string): Promise<{ user: IUser; tokens: IAuthTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Account is suspended' });
    }

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), status: user.status === 'PENDING' ? 'ACTIVE' : user.status },
    });

    await this.auditLog.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'auth',
      ipAddress: ip,
    });

    return { user: this.sanitize(user), tokens };
  }

  async refresh(userId: string, incomingToken: string): Promise<IAuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
    if (!user?.refreshToken) {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Refresh token revoked' });
    }

    const valid = await bcrypt.compare(incomingToken, user.refreshToken);
    if (!valid) {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Refresh token mismatch' });
    }

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveRefreshToken(user.id, tokens);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    await this.auditLog.log({ userId, action: 'LOGOUT', entity: 'auth' });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) {
      throw new BadRequestException({ code: 'TOKEN_INVALID', message: 'Invalid or expired verification token' });
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null, status: 'ACTIVE' },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { pwResetToken: token, pwResetExpires: expires },
    });

    this.logger.log(`[DEV] Password reset token for ${user.email}: ${token}`);
    // In prod: send email with reset link
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { pwResetToken: dto.token, pwResetExpires: { gt: new Date() } },
    });
    if (!user) {
      throw new BadRequestException({ code: 'TOKEN_INVALID', message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, pwResetToken: null, pwResetExpires: null, refreshToken: null },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException({ code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' });
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash, refreshToken: null } });
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId, deletedAt: null } });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    return this.sanitize(user);
  }

  private async generateTokens(userId: string, role: string): Promise<IAuthTokens> {
    const payload: Omit<IJwtPayload, 'iat' | 'exp'> = { sub: userId, role: role as IJwtPayload['role'] };
    const accessToken = this.jwt.sign(payload, {
      secret: process.env['JWT_ACCESS_SECRET'],
      expiresIn: ACCESS_EXPIRES,
    });
    return { accessToken, expiresIn: 15 * 60 };
  }

  private async saveRefreshToken(userId: string, tokens: IAuthTokens): Promise<void> {
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { secret: process.env['JWT_REFRESH_SECRET'], expiresIn: REFRESH_EXPIRES },
    );
    const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
    // Note: actual refresh token sent via httpOnly cookie in controller
    (tokens as IAuthTokens & { _refreshToken: string })['_refreshToken'] = refreshToken;
  }

  sanitize(u: any): IUser {
    const { passwordHash, refreshToken, emailVerifyToken, pwResetToken, pwResetExpires, emailVerified, ...safe } = u;
    void passwordHash, refreshToken, emailVerifyToken, pwResetToken, pwResetExpires, emailVerified;
    return {
      ...safe,
      role: safe.role as UserRole,
      department: safe.department as Department | null,
      lastLoginAt: safe.lastLoginAt ? (safe.lastLoginAt as Date).toISOString() : null,
      createdAt: (safe.createdAt as Date).toISOString(),
      updatedAt: (safe.updatedAt as Date).toISOString(),
      deletedAt: safe.deletedAt ? (safe.deletedAt as Date).toISOString() : null,
    } as IUser;
  }
}
