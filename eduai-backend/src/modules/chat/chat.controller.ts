import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send message (auto-creates conversation)' })
  @ApiBody({ type: SendMessageDto })
  @ApiCreatedResponse({ description: 'Message sent successfully' })
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(
      dto.senderId,
      dto.receiverId,
      dto.content,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiQuery({ name: 'userId', type: String, required: true })
  @ApiOkResponse({ description: 'Conversations fetched successfully' })
  async getMyConversations(@Query('userId') userId: string) {
    return this.chatService.getMyConversations(userId);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiOkResponse({ description: 'Messages fetched successfully' })
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.getConversationMessages(conversationId);
  }

  @Patch('messages/:messageId/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiOkResponse({ description: 'Message marked as read' })
  async markMessageAsRead(@Param('messageId') messageId: string) {
    return this.chatService.markMessageAsRead(messageId);
  }
}
