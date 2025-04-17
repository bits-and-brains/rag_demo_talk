import ServerMessageHandler from './ServerMessageHandler';
import ChatMessageHandler from './ChatMessageHandler';
import TypingIndicatorHandler from './TypingIndicatorHandler';
import AgentResponseHandler from './AgentResponseHandler';

// Registry of all message handlers
const messageHandlers = [
  ServerMessageHandler,
  ChatMessageHandler,
  TypingIndicatorHandler,
  AgentResponseHandler
];

/**
 * Process a message using the appropriate handler
 * @param {Object} message - The message to process
 * @param {Object} callbacks - Object containing callback functions for different message types
 */
export const processMessage = (message, callbacks) => {
  try {
    // Parse the message if it's a string
    const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
    
    // Find a handler that can process this message
    const handler = messageHandlers.find(h => h.canHandle(parsedMessage));
    
    if (handler) {
      // Call the appropriate callback based on the message type
      if (parsedMessage.type === 'server_message' || parsedMessage.type === 'chat_message') {
        handler.handle(parsedMessage, callbacks.addMessage);
      } else if (parsedMessage.type === 'typing_start' || parsedMessage.type === 'typing_end') {
        handler.handle(parsedMessage, callbacks.setTyping);
      } else if (parsedMessage.type === 'agent_response') {
        handler.handle(parsedMessage, callbacks.addMessage);
      }
    } else {
      console.warn('No handler found for message type:', parsedMessage.type);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}; 