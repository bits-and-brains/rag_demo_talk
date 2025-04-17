import { Message } from '../llm/types';

export class MessageHistory {
    private static instance: MessageHistory;
    private messages: Message[] = [];

    private constructor() {}

    public static getInstance(): MessageHistory {
        if (!MessageHistory.instance) {
            MessageHistory.instance = new MessageHistory();
        }
        return MessageHistory.instance;
    }

    public addMessage(role: 'user' | 'assistant', content: string): void {
        this.messages.push({ role, content });
    }

    public getMessages(): Message[] {
        return [...this.messages];
    }

    public clear(): void {
        this.messages = [];
    }
} 