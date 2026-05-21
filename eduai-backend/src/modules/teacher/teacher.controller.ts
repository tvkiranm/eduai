import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { TeacherService } from './teacher.service';

@ApiTags('Teacher')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get teacher dashboard' })
  dashboard(@CurrentUser() user: User) {
    return this.teacherService.dashboard(user);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get logged-in teacher courses' })
  myCourses(@CurrentUser() user: User) {
    return this.teacherService.myCourses(user);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get teacher course details' })
  courseDetails(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.teacherService.courseDetails(courseId, user);
  }

  @Get('courses/:courseId/students')
  @ApiOperation({ summary: 'Get enrolled students of teacher course' })
  enrolledStudents(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.teacherService.enrolledStudents(courseId, user);
  }

  @Get('courses/:courseId/stats')
  @ApiOperation({ summary: 'Get teacher course stats' })
  courseStats(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.teacherService.courseStats(courseId, user);
  }
}
