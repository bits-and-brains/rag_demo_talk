import {LogRequestHandler} from "./server_src/requst_processing/LogRequestHandler";
import {ChatRequestHandler} from "./server_src/requst_processing/ChatRequestHandler";
import {ClearChatRequestHandler} from "./server_src/requst_processing/ClearChatRequestHandler";
import {GetChatRequestHandler} from "./server_src/requst_processing/GetChatRequestHandler";
import { addClient, removeClient } from './server_src/utils/websocket';
import { MessageProcessorManager } from './server_src/websocket_processors/MessageProcessorManager';

const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;

// Load environment variables
require('dotenv').config();

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:7000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware if enabled
if (process.env.CORS_ENABLED === 'true') {
  app.use(cors(corsOptions));
  console.log(`CORS enabled with origin: ${corsOptions.origin}`);
}

// Parse JSON bodies
app.use(express.json());

// Create WebSocket server on a separate port
const wss = new WebSocketServer({ port: wsPort });

// Initialize the message processor manager
const messageProcessorManager = new MessageProcessorManager();

wss.on('connection', (ws) => {
  console.log('New client connected');
  addClient(ws);

  ws.on('message', (message) => {
    // Process the message using the message processor manager
    messageProcessorManager.processMessage(message.toString(), ws);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    removeClient(ws);
  });
});

app.get('/', (req, res) => {
    res.send('Rag DEMO')
})

const logHandler = new LogRequestHandler();
app.get('/logs', logHandler.processRequest.bind(logHandler))
const chatHandler = new ChatRequestHandler();
app.post('/chat', chatHandler.processRequest.bind(chatHandler))
const getChatRequestHandler = new GetChatRequestHandler();
app.get('/chat', getChatRequestHandler.processRequest.bind(getChatRequestHandler))
const clearChatRequestHandler = new ClearChatRequestHandler();
app.delete('/chat', clearChatRequestHandler.processRequest.bind(clearChatRequestHandler))

server.listen(port, () => {
    console.log(`HTTP Server listening on port ${port}`)
})

console.log(`WebSocket Server listening on port ${wsPort}`)
