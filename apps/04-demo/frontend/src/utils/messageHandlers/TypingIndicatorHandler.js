import MessageHandler from './MessageHandler';

/**
 * Handler for typing indicators
 * Processes messages with type 'typing_start' and 'typing_end'
 */
class TypingIndicatorHandler extends MessageHandler {
  canHandle(message) {
    return message.type === 'typing_start' || message.type === 'typing_end';
  }

  handle(message, callback) {
    if (this.canHandle(message)) {
      // Set typing state based on message type
      callback(message.type === 'typing_start');
    }
  }
}

export default new TypingIndicatorHandler(); 