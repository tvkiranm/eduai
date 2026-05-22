import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course, CourseStatus } from './entities/course.entity';
import { makeUniqueSlug, toSlug } from '../../common/slug';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCourseDto, user: User): Promise<Course> {
    let teacherId = user.id;

    if (user.role === UserRole.ADMIN) {
      if (!dto.teacherId) {
        throw new BadRequestException(
          'Please assign a teacher for this course',
        );
      }

      const teacher = await this.userRepository.findOne({
        where: {
          id: dto.teacherId,
          role: UserRole.TEACHER,
          isActive: true,
        },
      });

      if (!teacher) {
        throw new BadRequestException('Invalid or inactive teacher selected');
      }

      teacherId = teacher.id;
    }

    const providedSlug = dto.slug ? toSlug(dto.slug) : '';
    const baseSlug = providedSlug || toSlug(dto.title);
    if (!baseSlug) {
      throw new BadRequestException('Slug is required');
    }

    const slug = providedSlug
      ? baseSlug
      : await makeUniqueSlug(baseSlug, async (candidate) => {
          const existing = await this.courseRepository.findOne({
            where: { slug: candidate },
            select: { id: true },
          });
          return Boolean(existing);
        });

    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    if (providedSlug) {
      const slugExists = await this.courseRepository.findOne({
        where: { slug },
        select: { id: true },
      });
      if (slugExists) {
        throw new BadRequestException('Course slug already exists');
      }
    }

    const course = this.courseRepository.create({
      ...dto,
      slug,
      teacherId,
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      this.throwIfUniqueSlugViolation(error);
      throw error;
    }
  }
  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      //   relations: ['category', 'teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublic(limit?: number): Promise<Course[]> {
    const take =
      typeof limit === 'number' && Number.isFinite(limit) && limit > 0
        ? Math.min(Math.floor(limit), 24)
        : undefined;

    return this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      ...(take ? { take } : {}),
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

    const normalizedSlug = dto.slug ? toSlug(dto.slug) : undefined;
    if (dto.slug && !normalizedSlug) {
      throw new BadRequestException('Slug is required');
    }

    if (normalizedSlug) {
      const existing = await this.courseRepository.findOne({
        where: { slug: normalizedSlug, id: Not(id) },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException('Course slug already exists');
      }
    }

    Object.assign(course, {
      ...dto,
      ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      this.throwIfUniqueSlugViolation(error);
      throw error;
    }
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const course = await this.findOne(id);

    if (user.role === UserRole.TEACHER && course.teacherId !== user.id) {
      throw new ForbiddenException('You can delete only your own course');
    }

    await this.courseRepository.remove(course);

    return { message: 'Course deleted successfully' };
  }

  private throwIfUniqueSlugViolation(error: unknown): void {
    if (!(error instanceof QueryFailedError)) return;
    const driverError = error.driverError as {
      code?: string;
      detail?: unknown;
    };
    if (driverError?.code !== '23505') return;

    const detail =
      typeof driverError.detail === 'string' ? driverError.detail : '';
    if (detail.includes('(slug)')) {
      throw new BadRequestException('Course slug already exists');
    }
  }
}
