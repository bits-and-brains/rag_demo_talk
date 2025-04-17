import * as dbMigrate from 'db-migrate';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function runMigration(options) {
    try {
        console.log(`Running migrations for environment: ${options.env}`);
        
        // Create a new instance of db-migrate
        const migration = dbMigrate.getInstance(true, {
            config: path.join(__dirname, 'database.json'),
            env: options.env
        });
        
        
        // Run migrations
        await migration.up();
        
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
} 