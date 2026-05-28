import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseModuleEntity } from './course-module.entity';
import { Lesson } from './lesson.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column('text')
  description!: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ default: 0 })
  price!: number;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status!: CourseStatus;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column()
  categoryId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column()
  teacherId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level!: CourseLevel;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CourseModuleEntity, (m) => m.course)
  modules!: CourseModuleEntity[];

  @OneToMany(() => Lesson, (l) => l.course)
  lessons!: Lesson[];
}
