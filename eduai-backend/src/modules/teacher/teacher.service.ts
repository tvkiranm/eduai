import {
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
export class TeacherService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async dashboard(user: User) {
    const totalCourses = await this.courseRepository.count({
      where: { teacherId: user.id },
    });

    const myCourses = await this.courseRepository.find({
      where: { teacherId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        thumbnailUrl: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });

    const courseIds = myCourses.map((course) => course.id);

    const totalStudents = courseIds.length
      ? await this.enrollmentRepository.count({
          where: courseIds.map((courseId) => ({ courseId })),
        })
      : 0;

    return {
      message: 'Teacher dashboard fetched successfully',
      data: {
        totalCourses,
        totalStudents,
        recentCourses: myCourses.slice(0, 5),
      },
    };
  }

  async myCourses(user: User) {
    const courses = await this.courseRepository.find({
      where: { teacherId: user.id },
      relations: {
        category: true,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Teacher courses fetched successfully',
      data: courses,
    };
  }

  async courseDetails(courseId: string, user: User) {
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

    if (course.teacherId !== user.id) {
      throw new ForbiddenException('You can access only your own course');
    }

    return {
      message: 'Teacher course details fetched successfully',
      data: course,
    };
  }

  async enrolledStudents(courseId: string, user: User) {
    await this.validateCourseOwnership(courseId, user);

    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      relations: {
        student: true,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Enrolled students fetched successfully',
      data: enrollments.map((item) => ({
        enrollmentId: item.id,
        enrolledAt: item.createdAt,
        student: {
          id: item.student.id,
          fullName: item.student.fullName,
          email: item.student.email,
          role: item.student.role,
        },
      })),
    };
  }

  async courseStats(courseId: string, user: User) {
    const course = await this.validateCourseOwnership(courseId, user);

    const totalStudents = await this.enrollmentRepository.count({
      where: { courseId },
    });

    return {
      message: 'Course stats fetched successfully',
      data: {
        courseId: course.id,
        title: course.title,
        status: course.status,
        totalStudents,
      },
    };
  }

  private async validateCourseOwnership(
    courseId: string,
    user: User,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.teacherId !== user.id) {
      throw new ForbiddenException('You can access only your own course');
    }

    return course;
  }
}
