import { WebSocket } from 'ws';

export interface WebSocketMessage {
    type: string;
    content: any;
}

export interface MessageProcessor {
    canProcess(message: WebSocketMessage): boolean;
    process(message: WebSocketMessage, ws: WebSocket): void;
} 