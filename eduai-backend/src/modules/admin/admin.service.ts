import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async dashboard() {
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      totalEnrollments,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { role: UserRole.TEACHER } }),
      this.userRepository.count({ where: { role: UserRole.STUDENT } }),
      this.courseRepository.count(),
      this.enrollmentRepository.count(),
    ]);

    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentCourses = await this.courseRepository.find({
      relations: { category: true, teacher: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      message: 'Admin dashboard fetched successfully',
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
        totalEnrollments,
        recentUsers,
        recentCourses,
      },
    };
  }

  async users() {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  async usersByRole(role: UserRole) {
    const users = await this.userRepository.find({
      where: { role },
      order: { createdAt: 'DESC' },
    });

    return {
      message: `${role} users fetched successfully`,
      data: users,
    };
  }

  async courses() {
    const courses = await this.courseRepository.find({
      relations: { category: true, teacher: true },
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  async toggleUserStatus(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;

    await this.userRepository.save(user);

    return {
      message: 'User status updated successfully',
      data: {
        id: user.id,
        isActive: user.isActive,
      },
    };
  }
}
