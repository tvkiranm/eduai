import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot.dto';
import { TestEmailDto } from './dto/test-email.dto';
import { seconds, Throttle } from '@nestjs/throttler';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse({
    description: 'Email already exists or validation failed',
  })
  public register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get access token' })
  @ApiOkResponse({ description: 'Login successful' })
  @ApiUnauthorizedResponse({
    description: 'Invalid email/password or inactive account',
  })
  public login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({
    default: {
      limit: 5,
      ttl: seconds(60),
      getTracker: (req: { ip?: string; body?: { email?: string } }) => {
        const email = (req.body?.email ?? '').toLowerCase().trim();
        return `${req.ip ?? 'unknown'}:${email || 'no-email'}`;
      },
    },
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email link' })
  @ApiOkResponse({ description: 'Reset link request accepted' })
  @ApiUnauthorizedResponse({
    description: 'Invalid email/password or inactive account',
  })
  public forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using email token' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid/expired token or weak password',
  })
  public resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a test email (non-production only)',
  })
  @ApiHeader({
    name: 'x-test-email-key',
    required: false,
    description:
      'If TEST_EMAIL_KEY is set on the server, this header must match it.',
  })
  @ApiOkResponse({ description: 'Email sent (or queued) successfully' })
  public testEmail(
    @Body() dto: TestEmailDto,
    @Headers('x-test-email-key') testEmailKey?: string,
  ) {
    const nodeEnv = process.env.NODE_ENV ?? 'development';
    if (nodeEnv === 'production') {
      throw new ForbiddenException(
        'This endpoint is not available in production',
      );
    }

    const requiredKey = process.env.TEST_EMAIL_KEY;
    if (requiredKey && testEmailKey !== requiredKey) {
      throw new ForbiddenException('Invalid test email key');
    }

    return this.authService.testEmail(dto.to, dto.subject, dto.html);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiOkResponse({ description: 'Profile fetched successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  public profile(@CurrentUser() user: User) {
    return {
      message: 'Profile fetched successfully',
      data: user,
    };
  }
}
