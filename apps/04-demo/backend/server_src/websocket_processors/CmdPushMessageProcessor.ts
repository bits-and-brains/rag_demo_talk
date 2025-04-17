import { WebSocket } from 'ws';
import { MessageProcessor, WebSocketMessage } from './MessageProcessor';
import { MessageService } from '../services/MessageService';

export class CmdPushMessageProcessor implements MessageProcessor {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    canProcess(message: WebSocketMessage): boolean {
        return message.type === 'cmd_push';
    }

    async process(message: WebSocketMessage, ws: WebSocket): Promise<void> {
        console.log('Processing cmd_push message:', message);
        
        // Use the message service to broadcast and save the message
        await this.messageService.broadcastAndSaveMessage({
            type: 'server_message',
            content: message.content
        });
        
        // Send acknowledgment back to the sender
        const response = JSON.stringify({
            type: 'ack',
            content: 'Message received and broadcasted'
        });
        
        ws.send(response);
    }
} 