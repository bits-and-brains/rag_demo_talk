import { v4 as uuidv4 } from 'uuid';
import { MessageRepository } from '../../databses/repositories/MessageRepository';

export class ClearChatRequestHandler {
    private messageRepository: MessageRepository;

    constructor() {
        this.messageRepository = new MessageRepository();
    }

    async processRequest(req, res) {
        const requestId = uuidv4();
        
        try {
            // Clear all messages using the repository
            await this.messageRepository.clearAllMessages();
            
            // Send success response
            await res.status(200).send({
                requestId,
                success: true,
                message: 'Chat history cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing chat history:', error);
            
            // Send error response
            await res.status(500).send({
                requestId,
                success: false,
                message: 'Failed to clear chat history',
                error: error.message
            });
        }
    }
}
