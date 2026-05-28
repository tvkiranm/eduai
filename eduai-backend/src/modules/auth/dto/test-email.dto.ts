import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class TestEmailDto {
  @ApiProperty({ example: 'someone@example.com' })
  @IsEmail()
  to!: string;

  @ApiPropertyOptional({ example: 'EduAI Test Email' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    example: '<p>Hello from EduAI</p>',
    description: 'Optional HTML body; a default template is used if omitted.',
  })
  @IsOptional()
  @IsString()
  html?: string;
}
