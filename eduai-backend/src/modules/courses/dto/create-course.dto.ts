import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'React JS Master Course' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'react-js-master-course' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Complete React course from basic to advanced' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 499 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 'beginner' })
  @IsString()
  level!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ enum: CourseStatus, example: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ example: 'teacher-user-uuid', required: false })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
