import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CourseLevel, CourseStatus } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'React JS Master Course' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'react-js-master-course', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

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

  // @ApiProperty({ example: 'beginner' })
  // @IsString()
  // level!: string;

  @ApiPropertyOptional({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

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
