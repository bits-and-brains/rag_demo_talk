import { WebSocket } from 'ws';
import { MessageProcessor, WebSocketMessage } from './MessageProcessor';
import { DefaultMessageProcessor } from './DefaultMessageProcessor';
import { CmdPushMessageProcessor } from './CmdPushMessageProcessor';

export class MessageProcessorManager {
    private processors: MessageProcessor[] = [];
    private defaultProcessor: MessageProcessor;

    constructor() {
        // Initialize with specific processors
        this.processors.push(new CmdPushMessageProcessor());
        
        // Set the default processor
        this.defaultProcessor = new DefaultMessageProcessor();
    }

    processMessage(messageData: string, ws: WebSocket): void {
        try {
            // Parse the message
            const message: WebSocketMessage = JSON.parse(messageData);
            
            // Find a processor that can handle this message type
            const processor = this.processors.find(p => p.canProcess(message));
            
            if (processor) {
                // Use the specific processor
                processor.process(message, ws);
            } else {
                // Use the default processor
                this.defaultProcessor.process(message, ws);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            
            // Send error response back to the client
            const errorResponse = JSON.stringify({
                type: 'error',
                content: 'Failed to process message'
            });
            
            ws.send(errorResponse);
        }
    }
} 