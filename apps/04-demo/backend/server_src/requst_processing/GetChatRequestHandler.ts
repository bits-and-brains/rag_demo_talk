import { v4 as uuidv4 } from 'uuid';
import { MessageRepository } from '../../databses/repositories/MessageRepository';

export class GetChatRequestHandler {
    private messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
    }

    async processRequest(req, res) {
        const requestId = uuidv4();
        
        try {
            // Get all messages using the repository
            const messages = await this.messageRepository.getAllMessages();
            
            // Send success response with the messages
            await res.status(200).send({
                requestId,
                success: true,
                messages
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            
            // Send error response
            await res.status(500).send({
                requestId,
                success: false,
                message: 'Failed to fetch chat messages',
                error: error.message
            });
        }
    }
}
