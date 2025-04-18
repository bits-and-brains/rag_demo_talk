import { ActionIdentifier } from './ActionIdentifier';
import { SimpleHistoryBasedPrompt } from './SimpleHistoryBasedPrompt';
import { ActionLoop } from '../agents/ActionLoop';
import { AcceptedActionType, ActionWithData, ActionDataItem } from '../agents/AgentManager';
import { RequestSummary } from './RequestSummary';
import { MessageHistory } from './MessageHistory';
import { v4 as uuidv4 } from 'uuid';
export class MessageInitProcessor {
    private actionIdentifier: ActionIdentifier;
    private simpleHistoryBasedPrompt: SimpleHistoryBasedPrompt;
    private actionLoop: ActionLoop;
    private requestSummary: RequestSummary;
    private messageHistory: MessageHistory;

    constructor() {
        this.actionIdentifier = new ActionIdentifier();
        this.simpleHistoryBasedPrompt = new SimpleHistoryBasedPrompt();
        this.actionLoop = ActionLoop.getInstance();
        this.requestSummary = new RequestSummary();
        this.messageHistory = MessageHistory.getInstance();
    }

    async processMessage(userMessage: string, sessionId?: string): Promise<string> {
        try {
            sessionId = sessionId || uuidv4();
            // Step 1: Identify actions
            const actionIdentification = await this.actionIdentifier.identifyActions(userMessage, sessionId);
            const messageData: ActionDataItem = {
                name: "message",
                value: userMessage
            };
            const actionSessionData: ActionDataItem = {
                name: "session_id",
                value: sessionId
            };
            // Step 2: Handle based on whether actions are required
            if (actionIdentification.actions_required) {
                // Convert actions to ActionWithData format
                const actionsWithData: ActionWithData[] = actionIdentification.selected_actions.map(action => ({
                    type: action,
                    data: [messageData, actionSessionData] // Default empty data array, can be populated with actual data if needed
                }));

                // Generate summary of request and actions
                const summary = await this.requestSummary.generateSummary(
                    userMessage,
                    actionIdentification.selected_actions,
                    sessionId
                );

                // Add summary to message history
                this.messageHistory.addMessage('assistant', summary);

                // Trigger action loop asynchronously
                this.triggerActionLoop(actionsWithData);

                return summary;
            } else {
                // No actions required, use message history for response
                return await this.simpleHistoryBasedPrompt.generateResponse(userMessage, sessionId);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            throw new Error('Failed to process message');
        }
    }

    private triggerActionLoop(actions: ActionWithData[]): void {
        // Start the action loop asynchronously
        // This allows the HTTP response to be sent immediately while actions are processed in the background
        setTimeout(() => {
            this.actionLoop.addActions(actions);
        }, 0);
    }
}
