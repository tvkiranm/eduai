import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'kiran@yopmail.com' })
  @IsEmail()
  email!: string;
}
