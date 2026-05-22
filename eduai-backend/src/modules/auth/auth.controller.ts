import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get access token' })
  @ApiOkResponse({ description: 'Login successful' })
  @ApiUnauthorizedResponse({
    description: 'Invalid email/password or inactive account',
  })
  public forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
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
