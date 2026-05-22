import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { StudentService } from './student.service';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('enrollments')
export class StudentEnrollmentsController {
  constructor(private readonly studentService: StudentService) {}

  @Post(':courseId')
  enroll(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.studentService.enroll(courseId, user);
  }

  @Get('my-courses')
  myCourses(@CurrentUser() user: User) {
    return this.studentService.myCourses(user);
  }
}
