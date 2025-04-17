import { handleCommand } from "./CommandHandler";

export function addSendMessageCommand(program) {
    program
        .command('send-message <message>')
        .description('Send a message to all connected clients via WebSocket')
        .action(handleCommand);
} 