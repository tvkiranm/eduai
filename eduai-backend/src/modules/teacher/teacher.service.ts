import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from '../courses/entities/course.entity';
import { CourseModuleEntity } from '../courses/entities/course-module.entity';
import { Lesson, LessonType } from '../courses/entities/lesson.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(CourseModuleEntity)
    private readonly courseModuleRepository: Repository<CourseModuleEntity>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,

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

  async seedTwoSumInteractiveLesson(courseId: string, user: User) {
    await this.validateCourseOwnership(courseId, user);

    const existing = await this.lessonRepository.findOne({
      where: {
        courseId,
        lessonType: LessonType.INTERACTIVE,
        title: 'Two Sum',
      },
      select: { id: true },
    });
    if (existing) {
      return {
        message: 'Two Sum interactive lesson already exists',
        data: { lessonId: existing.id },
      };
    }

    let module = await this.courseModuleRepository.findOne({
      where: { courseId, title: 'Algorithms (Interactive)' },
    });

    if (!module) {
      const maxPosition = await this.courseModuleRepository
        .createQueryBuilder('m')
        .select('MAX(m.position)', 'max')
        .where('m.courseId = :courseId', { courseId })
        .getRawOne<{ max: string | null }>();

      module = this.courseModuleRepository.create({
        courseId,
        title: 'Algorithms (Interactive)',
        description:
          'Interactive algorithm lessons with visualizations + practice.',
        position: Number(maxPosition?.max ?? 0) + 1,
      });
      module = await this.courseModuleRepository.save(module);
    }

    const interactiveConfig = {
      visualType: 'array',
      concept: {
        title: 'Two Sum',
        description:
          'Given an array of numbers and a target, return indices of the two numbers that add up to target.\n\nGoal: learn the hash map approach visually (O(n)).',
      },
      hints: [
        'Use a map to store value → index as you scan the array.',
        'For each number x, check if (target - x) is already in the map.',
        'Return the pair of indices when you find the complement.',
      ],
      steps: [
        {
          title: 'Start',
          action: 'init',
          payload: { nums: [2, 7, 11, 15], target: 9 },
        },
        {
          title: 'i = 0 (num = 2)',
          action: 'scan',
          payload: { i: 0, num: 2, complement: 7, mapAfter: { 2: 0 } },
        },
        {
          title: 'i = 1 (num = 7) → found complement 2',
          action: 'found',
          payload: { i: 1, num: 7, complement: 2, answer: [0, 1] },
        },
      ],
      practice: {
        language: 'javascript',
        starterCode:
          'function twoSum(nums, target) {\n  // TODO: return [i, j]\n}\n',
        functionName: 'twoSum',
        testCases: [
          { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1] },
          { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2] },
          { input: { nums: [3, 3], target: 6 }, output: [0, 1] },
        ],
      },
      xp: { reward: 25 },
    };

    const maxLessonPosition = await this.lessonRepository
      .createQueryBuilder('l')
      .select('MAX(l.position)', 'max')
      .where('l.moduleId = :moduleId', { moduleId: module.id })
      .getRawOne<{ max: string | null }>();

    const lesson = await this.lessonRepository.save(
      this.lessonRepository.create({
        courseId,
        moduleId: module.id,
        title: 'Two Sum',
        description: 'Interactive lesson: visualize + code + test your solution.',
        lessonType: LessonType.INTERACTIVE,
        position: Number(maxLessonPosition?.max ?? 0) + 1,
        interactiveConfig,
        xpReward: 25,
      }),
    );

    return {
      message: 'Two Sum interactive lesson seeded successfully',
      data: { moduleId: module.id, lessonId: lesson.id },
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
