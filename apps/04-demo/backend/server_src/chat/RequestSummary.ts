import { LLMProviderFactory } from '../llm/LLMProviderFactory';
import { Message } from '../llm/types';
import { AcceptedActionType } from '../agents/AgentManager';
import { PromptTemplateService } from './PromptTemplateService';

export class RequestSummary {
    private llmProvider;
    private promptTemplateService: PromptTemplateService;

    constructor() {
        const factory = LLMProviderFactory.getInstance();
        this.llmProvider = factory.getProvider('gemini');
        this.promptTemplateService = PromptTemplateService.getInstance();
    }

    async generateSummary(userMessage: string, actions: AcceptedActionType[]): Promise<string> {
        try {
            const systemPrompt = await this.promptTemplateService.getCompiledPrompt('action summary', [
                { name: 'selected_actions', value: actions }
            ]);

            const messages: Message[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];

            return await this.llmProvider.getCompletion(messages, {
                model: 'gemini-1.5-pro'
            });
        } catch (error) {
            console.error('Error generating summary:', error);
            throw new Error('Failed to generate summary');
        }
    }
}
