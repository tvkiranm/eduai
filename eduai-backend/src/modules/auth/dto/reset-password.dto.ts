import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Raw reset token from the email link',
    example:
      '27bfc5b434b977620545fa92cc50e5a4d11e667a54f62dc637e8757045001301',
  })
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8, example: 'NewPassword@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

