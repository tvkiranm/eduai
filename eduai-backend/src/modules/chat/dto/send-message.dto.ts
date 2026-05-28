import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-sender-id' })
  @IsUUID()
  senderId!: string;

  @ApiProperty({ example: 'uuid-receiver-id' })
  @IsUUID()
  receiverId!: string;

  @ApiProperty({ example: 'Hi' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

