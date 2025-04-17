import { Command } from 'commander';
import { configureQdrantCommand } from './commands/qdrant-propagation.js';
import { configureWeaviateCommand } from './commands/weaviate-propagation.js';
import { configurePostgresCommand } from './commands/postgres-propagation.js';
import { configureElasticsearchCommand } from './commands/elasticsearch-propagation.js';

const program = new Command();

program
  .name('recipe-embeddings')
  .description('CLI for managing recipe embeddings in vector databases')
  .version('1.0.0');

configureQdrantCommand(program);
configureWeaviateCommand(program);
configurePostgresCommand(program);
configureElasticsearchCommand(program);

program.parse(process.argv); 