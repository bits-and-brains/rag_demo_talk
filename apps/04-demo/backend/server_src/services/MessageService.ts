import { WebSocket } from 'ws';
import { MessageRepository } from '../../databses/repositories/MessageRepository';
import { broadcastMessage } from '../utils/websocket';
import { MessageAuthor } from '../../databses/models/Message';

export interface BroadcastMessageOptions {
    type: string;
    content: any
}

export class MessageService {
    private messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
    }

    /**
     * Broadcasts a message to all connected clients and saves it to the database
     * @param options Message options containing type, content and author
     * @returns Promise<void>
     */
    async broadcastAndSaveMessage(options: BroadcastMessageOptions): Promise<void> {
        const { type, content } = options;

        // Create the broadcast data
        const broadcastData = JSON.stringify({
            type,
            content
        });

        // Broadcast the message to all connected clients
        broadcastMessage(broadcastData);

        // Save the message to the database
        await this.messageRepository.insertMessage(
            typeof content === 'string' ? content : JSON.stringify(content),
            'assistant'
        );
    }
} 