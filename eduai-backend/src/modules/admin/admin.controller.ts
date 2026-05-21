import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard' })
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  users() {
    return this.adminService.users();
  }

  @Get('teachers')
  teachers() {
    return this.adminService.usersByRole(UserRole.TEACHER);
  }

  @Get('students')
  students() {
    return this.adminService.usersByRole(UserRole.STUDENT);
  }

  @Get('courses')
  courses() {
    return this.adminService.courses();
  }

  @Patch('users/:id/toggle-status')
  toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }
}
