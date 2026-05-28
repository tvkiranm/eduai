import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzeResumeDto {
  @ApiProperty({
    required: false,
    example: 'Frontend developer JD...',
    description:
      'Optional job description to tailor analysis (if implemented).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  jobDescription?: string;
}
