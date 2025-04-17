import { ActionDataItem } from './AgentManager';
import { broadcastMessage } from '../utils/websocket';
import { MessageRepository } from '../../databses/repositories/MessageRepository';
import { MessageAuthor } from '../../databses/models/Message';

export abstract class Agent {
    protected messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
    }

    abstract execute(data?: ActionDataItem[]): Promise<void>;
    
    /**
     * Sends a response message back to the user via WebSocket and saves it to the database
     * @param response The response message to send
     */
    protected async sendResponse(response: string): Promise<void> {
        const message = {
            type: 'server_message',
            content: response,
            timestamp: new Date().toISOString()
        };
        
        // Broadcast the message to all connected clients
        broadcastMessage(JSON.stringify(message));
        
        // Save the message to the database
        await this.messageRepository.insertMessage(
            response,
            'assistant' as MessageAuthor
        );
    }
} 