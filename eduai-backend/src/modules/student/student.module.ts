import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { StudentEnrollmentsController } from './student-enrollments.controller';
import { CourseModuleEntity } from '../courses/entities/course-module.entity';
import { Lesson } from '../courses/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, CourseModuleEntity, Lesson])],
  controllers: [StudentController, StudentEnrollmentsController],
  providers: [StudentService],
})
export class StudentModule {}
