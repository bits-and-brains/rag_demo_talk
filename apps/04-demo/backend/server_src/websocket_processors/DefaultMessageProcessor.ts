import { WebSocket } from 'ws';
import { MessageProcessor, WebSocketMessage } from './MessageProcessor';

export class DefaultMessageProcessor implements MessageProcessor {
    canProcess(message: WebSocketMessage): boolean {
        // This processor can handle any message type
        return true;
    }

    process(message: WebSocketMessage, ws: WebSocket): void {
        // Log the message content
        console.log('Default processor handling message:', message);
        
        // If the content is a string, log it directly
        if (typeof message.content === 'string') {
            console.log('Message content:', message.content);
        } else {
            // Otherwise, stringify the content
            console.log('Message content:', JSON.stringify(message.content));
        }
    }
} 