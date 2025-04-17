import { runMigration } from "../../../databses/run-migration";
import { createMigration } from "../../../databses/create-migration";

export function addMigrationsCommand(program) {
    program
        .command('run-migrations')
        .description('Run database migrations')
        .option('-e, --env <environment>', 'Environment to run migrations against', 'dev')
        .action(runMigration);
        
    program
        .command('create-migration')
        .description('Create a new migration file')
        .argument('<name>', 'Name of the migration (e.g., create-users-table)')
        .action((name) => {
            createMigration(name);
        });
} 