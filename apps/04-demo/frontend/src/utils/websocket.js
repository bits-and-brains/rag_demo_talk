class WebSocketService {
    constructor() {
        this.ws = null;
        this.messageHandlers = new Set();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10; // Limit reconnection attempts
        this.reconnectInterval = 10000; // 10 seconds
        this.reconnectTimer = null;
    }

    connect() {
        // If already connected or attempting to connect, don't try again
        if (this.ws && (this.isConnected || this.ws.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket already connected or connecting');
            return;
        }

        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Use the WebSocket URL from environment variables
        const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        this.ws.onmessage = (event) => {
            const message = event.data;
            this.messageHandlers.forEach(handler => handler(message));
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            
            // Try to reconnect after the specified interval
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    scheduleReconnect() {
        // Don't schedule a reconnect if we've reached the max attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached. Giving up.');
            return;
        }

        // Increment reconnect attempts
        this.reconnectAttempts++;
        
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${this.reconnectInterval/1000} seconds`);
        
        // Schedule a reconnect
        this.reconnectTimer = setTimeout(() => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
        }, this.reconnectInterval);
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    sendMessage(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(message);
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    disconnect() {
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService; 