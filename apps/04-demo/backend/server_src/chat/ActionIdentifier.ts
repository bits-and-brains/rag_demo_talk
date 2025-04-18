import { LLMProviderFactory } from '../llm/LLMProviderFactory';
import { Message } from '../llm/types';
import { PromptTemplateService } from './PromptTemplateService';
import { AcceptedActionType, AgentManager } from '../agents/AgentManager';

export interface ActionIdentification {
    actions_required: boolean;
    selected_actions: AcceptedActionType[];
}

export class ActionIdentifier {
    private llmProvider;
    private promptTemplateService: PromptTemplateService;

    constructor() {
        const factory = LLMProviderFactory.getInstance();
        this.llmProvider = factory.getProvider('gemini');
        this.promptTemplateService = PromptTemplateService.getInstance();
    }

    private validateActionIdentification(response: any): ActionIdentification {
        // Ensure selected_actions only contains valid ActionType values
        const validActions = response.selected_actions?.filter((action: string) =>
            AgentManager.isValidAction(action)
        ) || [];

        // If no valid actions are selected, ensure actions_required is false
        if (validActions.length === 0) {
            return {
                actions_required: false,
                selected_actions: []
            };
        }

        // If there are valid actions, ensure actions_required is true
        return {
            actions_required: true,
            selected_actions: validActions as AcceptedActionType[]
        };
    }

    async identifyActions(userMessage: string, sessionId?: string): Promise<ActionIdentification> {
        try {
            const actionsList = AgentManager.getActionsList();
            const systemPrompt = await this.promptTemplateService.getCompiledPrompt('action identification', [
                { name: 'actions_list', value: actionsList }
            ]);

            const messages: Message[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];

            const response = await this.llmProvider.getCompletion(messages, {
                model: 'gemini-1.5-pro',
                sessionId: sessionId
            });
            // Clean the response by removing any backticks and "json" markers
            const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();

            const parsedResponse = JSON.parse(cleanedResponse);
            return this.validateActionIdentification(parsedResponse);
        } catch (error) {
            console.error('Error identifying actions:', error);
            return { actions_required: false, selected_actions: [] };
        }
    }
}
