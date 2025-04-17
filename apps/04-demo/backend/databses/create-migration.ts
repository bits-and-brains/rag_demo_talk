import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a new migration file with the given name
 * @param name The name of the migration (e.g., 'create-users-table')
 */
export function createMigration(name: string): void {
    // Get the current date and time in the format YYYYMMDDHHMMSS
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
    
    // Create the filename
    const filename = `${timestamp}-${name}.js`;
    
    // Create the file path
    const migrationsDir = path.join(__dirname, '../migrations');
    const filePath = path.join(migrationsDir, filename);
    
    // Create the file content with db-migrate format
    const content = `'use strict';

/**
 * Migration: ${name}
 * Date: ${now.toISOString().split('T')[0]}
 */

exports.up = function(db, callback) {
  db.runSql(\`
    -- Add your SQL here
  \`, callback);
};

exports.down = function(db, callback) {
  db.runSql(\`
    -- Add your rollback SQL here
  \`, callback);
};
`;
    
    // Write the file
    fs.writeFileSync(filePath, content);
    
    console.log(`Created migration file: ${filename}`);
} 