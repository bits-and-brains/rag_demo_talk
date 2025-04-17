import { broadcastMessage } from '../utils/websocket';
import { AcceptedActionType, AgentManager, ActionWithData } from './AgentManager';

export class ActionLoop {
    private actionQueue: ActionWithData[] = [];
    private isProcessing: boolean = false;
    private static instance: ActionLoop;
    private agentManager: AgentManager;

    private constructor() {
        this.agentManager = AgentManager.getInstance();
    }

    public static getInstance(): ActionLoop {
        if (!ActionLoop.instance) {
            ActionLoop.instance = new ActionLoop();
        }
        return ActionLoop.instance;
    }

    private async executeAction(actionWithData: ActionWithData): Promise<void> {
        try {
            await this.agentManager.executeAction(actionWithData.type, actionWithData.data);
        } catch (error) {
            console.error(`Error executing action ${actionWithData.type}:`, error);
            // Broadcast error to clients
            this.broadcastActionStatus(actionWithData, 'error', error.message);
        }
    }

    private broadcastActionStatus(actionWithData: ActionWithData, status: 'start' | 'complete' | 'error', details?: string) {
        const message = {
            type: 'action_status',
            content: {
                action: actionWithData.type,
                status,
                details,
                timestamp: new Date().toISOString()
            }
        };
        broadcastMessage(JSON.stringify(message));
    }

    public addActions(actions: ActionWithData[]): void {
        this.actionQueue.push(...actions);
        if (!this.isProcessing) {
            this.startProcessing();
        }
    }

    private async startProcessing(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.actionQueue.length > 0) {
            const actionWithData = this.actionQueue.shift()!;

            // Broadcast action start
            this.broadcastActionStatus(actionWithData, 'start');

            // Execute the action
            await this.executeAction(actionWithData);

            // Broadcast action completion
            this.broadcastActionStatus(actionWithData, 'complete');
        }

        this.isProcessing = false;
    }
}
