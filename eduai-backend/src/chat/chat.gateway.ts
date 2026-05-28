import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';

import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) return;

    client.data.userId = userId;
    client.join(this.userRoom(userId));
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('sendMessage')
  handleLegacyBroadcast(@MessageBody() message: unknown) {
    this.server?.emit('receiveMessage', message);
  }

  @SubscribeMessage('chat:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { userId?: string },
  ) {
    const userId =
      typeof body?.userId === 'string' && body.userId.trim()
        ? body.userId.trim()
        : undefined;
    if (!userId) return { ok: false, error: 'userId is required' };

    client.data.userId = userId;
    client.join(this.userRoom(userId));
    return { ok: true };
  }

  @SubscribeMessage('chat:ping')
  handlePing() {
    return { ok: true, ts: Date.now() };
  }

  emitNewMessage(payload: {
    conversationId: string;
    message: unknown;
    participantIds: string[];
    conversation?: unknown;
  }): void {
    if (!this.server) return;
    const uniqueParticipantIds = Array.from(
      new Set((payload.participantIds ?? []).filter(Boolean)),
    );
    uniqueParticipantIds.forEach((userId) => {
      this.server.to(this.userRoom(userId)).emit('chat:newMessage', payload);
    });
  }

  emitConversationUpsert(payload: {
    conversation: unknown;
    participantIds: string[];
  }): void {
    if (!this.server) return;
    const uniqueParticipantIds = Array.from(
      new Set((payload.participantIds ?? []).filter(Boolean)),
    );
    uniqueParticipantIds.forEach((userId) => {
      this.server
        .to(this.userRoom(userId))
        .emit('chat:conversationUpsert', payload);
    });
  }

  private extractUserId(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.userId;
    if (typeof fromAuth === 'string' && fromAuth.trim()) return fromAuth.trim();

    const fromQuery = client.handshake.query?.userId;
    if (typeof fromQuery === 'string' && fromQuery.trim())
      return fromQuery.trim();

    return undefined;
  }
}
