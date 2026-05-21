import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(dto: CreateCourseDto, user: User): Promise<Course> {
    const course = this.courseRepository.create({
      ...dto,
      teacherId: user.id,
    });

    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      //   relations: ['category', 'teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      //   relations: ['category', 'teacher'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: string,
    dto: Partial<CreateCourseDto>,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (user.role === UserRole.TEACHER && course.teacherId !== user.id) {
      throw new ForbiddenException('You can update only your own course');
    }

    Object.assign(course, dto);

    return this.courseRepository.save(course);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const course = await this.findOne(id);

    if (user.role === UserRole.TEACHER && course.teacherId !== user.id) {
      throw new ForbiddenException('You can delete only your own course');
    }

    await this.courseRepository.remove(course);

    return { message: 'Course deleted successfully' };
  }
}
