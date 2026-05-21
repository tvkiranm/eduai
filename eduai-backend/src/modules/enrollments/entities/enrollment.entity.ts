import { Course } from 'src/modules/courses/entities/course.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student!: User;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @CreateDateColumn()
  createdAt!: Date;
}
