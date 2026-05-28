import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseModuleEntity } from './course-module.entity';

export enum LessonType {
  VIDEO = 'video',
  INTERACTIVE = 'interactive',
  QUIZ = 'quiz',
  ARTICLE = 'article',
}

@Entity('lessons')
@Index(['courseId', 'moduleId', 'position'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column()
  courseId!: string;

  @ManyToOne(() => CourseModuleEntity, (module) => module.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'moduleId' })
  module!: CourseModuleEntity;

  @Column()
  moduleId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: LessonType, default: LessonType.VIDEO })
  lessonType!: LessonType;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'text', nullable: true })
  videoUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  articleContent?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  interactiveConfig?: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  quizConfig?: Record<string, unknown> | null;

  @Column({ type: 'int', default: 25 })
  xpReward!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

