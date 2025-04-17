import MessageHandler from './MessageHandler';

let messageIdCounter = 0;

/**
 * Handler for chat messages
 * Processes messages with type 'chat_message'
 */
class ChatMessageHandler extends MessageHandler {
  canHandle(message) {
    return message.type === 'chat_message';
  }

  handle(message, callback) {
    if (this.canHandle(message)) {
      // Add the message to chat history as a message from the assistant
      callback({
        id: `msg_${messageIdCounter++}`,
        content: message.content,
        author: 'assistant',
        created_at: new Date().toISOString()
      });
    }
  }
}

export default new ChatMessageHandler(); 