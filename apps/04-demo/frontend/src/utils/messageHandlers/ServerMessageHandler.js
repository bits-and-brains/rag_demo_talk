import MessageHandler from './MessageHandler';

/**
 * Handler for server messages
 * Processes messages with type 'server_message'
 */
class ServerMessageHandler extends MessageHandler {
  canHandle(message) {
    return message.type === 'server_message';
  }

  handle(message, callback) {
    if (this.canHandle(message)) {
      // Add the message to chat history as a message from the assistant
      callback({
        id: Date.now(),
        content: message.content,
        author: 'assistant',
        created_at: new Date().toISOString()
      });
    }
  }
}

export default new ServerMessageHandler(); 