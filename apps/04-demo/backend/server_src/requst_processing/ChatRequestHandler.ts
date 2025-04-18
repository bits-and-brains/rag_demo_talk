import { v4 as uuidv4} from 'uuid';
import { MessageRepository } from '../../databses/repositories/MessageRepository';
import { MessageInitProcessor } from '../chat/MessageInitProcessor';
import { Message } from '../../databses/models/Message';

export class ChatRequestHandler {
    private messageRepository: MessageRepository;
    private messageProcessor: MessageInitProcessor;

    constructor() {
        this.messageRepository = new MessageRepository();
        this.messageProcessor = new MessageInitProcessor();
    }

    async processRequest(req, res) {
        const requestId = uuidv4();
        try {
            const { message } = req.body;
            
            if (!message || typeof message !== 'string') {
                return res.status(400).json({ 
                    requestId,
                    error: 'Invalid message format. Expected a string message.' 
                });
            }

            // Generate a new session ID if not provided
            const currentSessionId = requestId;

            // Save user message with session ID
            const userMessage = await this.messageRepository.insertMessage(message, 'user', currentSessionId);

            // Process message with OpenAI
            const assistantResponse = await this.messageProcessor.processMessage(message, currentSessionId);

            // Save assistant response with session ID
            const assistantMessage = await this.messageRepository.insertMessage(assistantResponse, 'assistant', currentSessionId);

            // Send response back
            res.json({
                requestId,
                messages: [{author: 'assistant', content: assistantMessage}]
            });
        } catch (error) {
            console.error('Error processing chat request:', error);
            res.status(500).json({
                requestId,
                error: 'Internal server error while processing chat request'
            });
        }
    }
}
