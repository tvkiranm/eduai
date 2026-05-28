import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/entities/user.entity';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create course - Admin/Teacher' })
  @ApiCreatedResponse({ description: 'Course created successfully' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiOkResponse({ description: 'Courses fetched successfully' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public courses (published only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of courses to return (1-24)',
  })
  findPublic(@Query('limit') limit?: string) {
    const parsed =
      typeof limit === 'string' && limit.trim()
        ? Number.parseInt(limit, 10)
        : undefined;
    return this.coursesService.findPublic(
      typeof parsed === 'number' && Number.isFinite(parsed)
        ? parsed
        : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update course - Admin/Teacher' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Delete course - Admin/Teacher' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.remove(id, user);
  }
}
