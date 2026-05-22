import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot.dto';
import { EmailService } from '../../shared/email/email.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokens: Repository<PasswordResetToken>,
  ) {}

  public async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const { password: _password, ...safeUser } = user;
    void _password;

    return {
      message: 'User registered successfully',
      data: safeUser,
    };
  }

  public async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const { password: _password, ...safeUser } = user;
    void _password;

    return {
      message: 'Login successful',
      data: {
        accessToken,
        user: safeUser,
      },
    };
  }

  public async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return {
        message:
          'If an account exists for this email, a reset link has been sent.',
      };
    }

    const expiresInMinutes = Number(
      this.configService.get<string>('PASSWORD_RESET_EXPIRES_MINUTES') ?? '30',
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.passwordResetTokens.insert({
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const base = frontendUrl.replace(/\/+$/, '');
    const resetLink = `${base}/reset-password?token=${rawToken}`;

    await this.emailService.sendForgotPasswordEmail(user.email, resetLink);

    return {
      message:
        'If an account exists for this email, a reset link has been sent.',
    };
  }

  public async testEmail(to: string, subject?: string, html?: string) {
    const resolvedSubject = subject?.trim() || 'EduAI Test Email';
    const resolvedHtml =
      html?.trim() ||
      `<h2>EduAI Test Email</h2><p>If you received this, SMTP is working.</p>`;

    const verify = await this.emailService.verify();
    if (!verify.ok) {
      throw new BadRequestException(
        'Email transporter is not configured correctly',
      );
    }

    const result = await this.emailService.sendMail(
      to,
      resolvedSubject,
      resolvedHtml,
    );

    return {
      message: 'Test email sent',
      data: {
        messageId: result.messageId,
      },
    };
  }

  public async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const now = new Date();

    const token = await this.passwordResetTokens.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.updatePassword(token.userId, hashedPassword);

    await this.passwordResetTokens.update(
      { id: token.id },
      { usedAt: new Date() },
    );

    return {
      message: 'Password reset successful. Please sign in again.',
    };
  }
}
