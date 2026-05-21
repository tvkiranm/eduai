import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async enroll(courseId: string, user: User) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const alreadyEnrolled = await this.enrollmentRepository.findOne({
      where: {
        studentId: user.id,
        courseId,
      },
    });

    if (alreadyEnrolled) {
      throw new BadRequestException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      studentId: user.id,
      courseId,
    });

    await this.enrollmentRepository.save(enrollment);

    return {
      message: 'Enrolled successfully',
      data: {
        course,
      },
    };
  }

  async dashboard(user: User) {
    const totalEnrolledCourses = await this.enrollmentRepository.count({
      where: { studentId: user.id },
    });

    const recentEnrollments = await this.enrollmentRepository.find({
      where: { studentId: user.id },
      relations: {
        course: {
          category: true,
          teacher: true,
        },
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      message: 'Student dashboard fetched successfully',
      data: {
        totalEnrolledCourses,
        recentCourses: recentEnrollments,
      },
    };
  }

  async myCourses(user: User) {
    const enrollments = await this.enrollmentRepository.find({
      where: { studentId: user.id },
      relations: {
        course: {
          category: true,
          teacher: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Student courses fetched successfully',
      data: enrollments,
    };
  }

  async courseDetail(courseId: string, user: User) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: user.id,
        courseId,
      },
      relations: {
        course: {
          category: true,
          teacher: true,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: {
        category: true,
        teacher: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      message: 'Student course detail fetched successfully',
      data: {
        enrollment,
        course,
      },
    };
  }
}
