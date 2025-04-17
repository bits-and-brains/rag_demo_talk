import { WebSocket } from 'ws';
import { broadcastMessage } from '../../../server_src/utils/websocket';
import { MessageRepository } from '../../../databses/repositories/MessageRepository';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function handleCommand(message: string) {
    try {
        if (!message) {
            console.error('Error: Message is required');
            return;
        }

        console.log(`Sending message: "${message}"`);

        // Get WebSocket port from environment variables
        const wsPort = process.env.WS_PORT || '7002';
        const wsHost = process.env.WS_HOST || 'localhost';

        // Create WebSocket client
        const ws = new WebSocket(`ws://${wsHost}:${wsPort}`);

        // Wait for connection to be established
        await new Promise((resolve, reject) => {
            ws.on('open', () => {
                console.log('Connected to WebSocket server');
                resolve(true);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });
        });

        // Send the message
        const messageData = JSON.stringify({
            type: 'cmd_push',
            content: message
        });
        ws.send(messageData);

        // Wait for a short time to ensure message is sent
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Close the connection
        ws.close();
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
} 