import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { StudentService } from './student.service';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get student dashboard' })
  dashboard(@CurrentUser() user: User) {
    return this.studentService.dashboard(user);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get student enrolled courses' })
  myCourses(@CurrentUser() user: User) {
    return this.studentService.myCourses(user);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get enrolled course detail' })
  courseDetail(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.studentService.courseDetail(courseId, user);
  }

  @Get('courses/:courseId/curriculum')
  @ApiOperation({ summary: 'Get enrolled course curriculum (modules + lessons)' })
  courseCurriculum(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.studentService.courseCurriculum(courseId, user);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Get lesson detail (supports interactive lessons)' })
  lessonDetail(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.studentService.lessonDetail(lessonId, user);
  }
}
