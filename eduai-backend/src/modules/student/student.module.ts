import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { StudentEnrollmentsController } from './student-enrollments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment])],
  controllers: [StudentController, StudentEnrollmentsController],
  providers: [StudentService],
})
export class StudentModule {}
