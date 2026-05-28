import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from '../../chat/chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly chatGateway: ChatGateway,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    if (!senderId || !receiverId || !content?.trim()) {
      throw new BadRequestException(
        'senderId, receiverId and content are required',
      );
    }

    if (senderId === receiverId) {
      throw new BadRequestException('senderId and receiverId must be different');
    }

    let conversation = await this.findConversation(senderId, receiverId);
    if (!conversation) {
      conversation = this.conversationRepository.create({
        participantIds: [senderId, receiverId],
      });

      conversation = await this.conversationRepository.save(conversation);
    }

    const message = this.messageRepository.create({
      conversationId: conversation.id,
      senderId,
      receiverId,
      content: content.trim(),
    });

    const savedMessage = await this.messageRepository.save(message);

    conversation.lastMessage = savedMessage.content;
    conversation.lastMessageAt = new Date();

    await this.conversationRepository.save(conversation);

    this.chatGateway.emitConversationUpsert({
      conversation,
      participantIds: conversation.participantIds,
    });

    this.chatGateway.emitNewMessage({
      conversationId: conversation.id,
      message: savedMessage,
      participantIds: conversation.participantIds,
      conversation,
    });

    return savedMessage;
  }

  async getMyConversations(userId: string) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':userId = ANY(conversation.participantIds)', { userId })
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();
  }

  async getConversationMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async markMessageAsRead(messageId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new BadRequestException('Message not found');
    }

    message.isRead = true;

    return this.messageRepository.save(message);
  }

  private async findConversation(senderId: string, receiverId: string) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where(':senderId = ANY(conversation.participantIds)', { senderId })
      .andWhere(':receiverId = ANY(conversation.participantIds)', {
        receiverId,
      })
      .getOne();
  }
}
