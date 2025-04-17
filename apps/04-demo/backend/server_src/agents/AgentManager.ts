import { Agent } from './Agent';
import { CheckLogsAgent } from './actions/CheckLogsAgent';
import { GetRecipeAgent } from './actions/GetRecipeAgent';

export interface ActionDefinition {
    name: AcceptedActionType;
    description: string;
}

export interface ActionDataItem {
    name: string;
    value: string | number | boolean;
}

export interface ActionWithData {
    type: AcceptedActionType;
    data: ActionDataItem[];
}

export const AVAILABLE_ACTIONS: ActionDefinition[] = [
    {
        name: 'check_logs',
        description: 'Use this when user asks about bugs, errors, or system logs'
    },
    {
        name: 'get_recipe',
        description: 'Use this action when user ask for a recipe or cooking instructions'
    }
];

export type AcceptedActionType = 'check_logs' | 'get_recipe';


export class AgentManager {
    private static instance: AgentManager;

    private constructor() {}

    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    public getAgentForAction(action: AcceptedActionType): Agent {
        switch (action) {
            case 'check_logs':
                return new CheckLogsAgent();
            case 'get_recipe':
                return new GetRecipeAgent();
            default:
                throw new Error(`No agent found for action: ${action}`);
        }
    }

    public async executeAction(action: AcceptedActionType, data?: ActionDataItem[]): Promise<void> {
        const agent = this.getAgentForAction(action);
        await agent.execute(data);
    }

    public static getActionsList(): string {
        return AVAILABLE_ACTIONS.map(action => `- ${action.name}: ${action.description}`).join('\n');
    }

    public static isValidAction(action: string): action is AcceptedActionType {
        return AVAILABLE_ACTIONS.some(validAction => validAction.name === action);
    }
}
