import { Command } from 'commander';
import { handleCommand } from './CommandHandler';

export function addQdrantPopulateCommand(program: Command) {
    program
        .command('qdrant-populate')
        .description('Generate embeddings for recipe files using OpenAI and store them in Qdrant')
        .option('-r, --recreate', 'Recreate collection if it already exists', false)
        .option('-b, --batch-size <size>', 'Number of files to process in each batch', '5')
        .action(handleCommand);
} 