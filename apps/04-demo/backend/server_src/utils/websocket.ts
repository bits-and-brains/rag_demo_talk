import { WebSocket } from 'ws';

let clients: Set<WebSocket> = new Set();

export const addClient = (ws: WebSocket) => {
    clients.add(ws);
};

export const removeClient = (ws: WebSocket) => {
    clients.delete(ws);
};

export const broadcastMessage = (message: string) => {
    clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}; 