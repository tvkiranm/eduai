import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  // Only authenticated users with ADMIN role can access this endpoint.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User list' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  public async listUsers() {
    const users = await this.usersService.findAll();
    return {
      message: 'User list',
      data: users,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  public async singleUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: 'User found',
      data: user,
    };
  }
}
