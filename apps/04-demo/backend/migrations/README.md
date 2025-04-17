# MySQL Migrations

This directory contains SQL migration files for the MySQL database.

## Migration File Naming Convention

Migration files should follow this naming convention:
```YYYYMMDDHHMMSS-description.sql
```

For example: `20240417000000-create-users-table.sql`

## Migration File Structure

Each migration file should contain:

1. A comment header with the migration name and date
2. The "Up" migration (what happens when migrating forward)
3. The "Down" migration (what happens when rolling back) - commented out by default

Example:
```sql
-- Migration: Create users table
-- Date: 2024-04-17

-- Up migration
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Down migration
-- DROP TABLE IF EXISTS users;
```

## Running Migrations

To run migrations, use the following command:

```bash
node cmd.js run-migrations
```

You can specify the environment with the `-e` or `--env` option:

```bash
node cmd.js run-migrations --env dev
```

## Creating New Migrations

To create a new migration file, use the following command:

```bash
node cmd.js create-migration <name>
```

For example:

```bash
node cmd.js create-migration create-posts-table
```

This will create a new migration file with the current timestamp and the specified name.

## Database Configuration

Database connection settings are stored in:
- `database.json` - For db-migrate configuration
- `.env` - For environment-specific variables 