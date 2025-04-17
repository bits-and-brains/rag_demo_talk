import { LLMProviderFactory } from '../llm/LLMProviderFactory';
import { Message as LLMMessage } from '../llm/types';
import { MessageRepository } from '../../databses/repositories/MessageRepository';

export class SimpleHistoryBasedPrompt {
    private llmProvider;
    private messageRepository: MessageRepository;
    private readonly systemPrompt = `You are a helpful AI assistant. Provide clear and concise responses to user queries.
Use the conversation history to maintain context and provide more relevant responses.`;

    constructor() {
        const factory = LLMProviderFactory.getInstance();
        this.llmProvider = factory.getProvider('gemini');
        this.messageRepository = new MessageRepository();
    }

    async generateResponse(userMessage: string): Promise<string> {
        try {
            // Get all messages from database
            const dbMessages = await this.messageRepository.getAllMessages();
            
            // Convert database messages to LLM message format
            const messages: LLMMessage[] = [
                { role: 'system', content: this.systemPrompt },
                ...dbMessages.map(msg => ({
                    role: msg.author,
                    content: msg.content
                }))
            ];

            const response = await this.llmProvider.getCompletion(messages, {
                model: 'gemini-1.5-pro'
            });

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            throw new Error('Failed to generate response');
        }
    }
} 