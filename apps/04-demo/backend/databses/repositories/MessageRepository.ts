import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { Message, MessageAuthor } from '../models/Message';

// Load environment variables
dotenv.config();

/**
 * Repository class for handling Message database operations
 */
export class MessageRepository {
    private pool: mysql.Pool;

    constructor() {
        // Create a connection pool
        this.pool = mysql.createPool({
            host: 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }

    /**
     * Get all messages from the database
     * @returns Promise<Message[]> Array of messages
     */
    async getAllMessages(): Promise<Message[]> {
        const connection = await this.pool.getConnection();
        
        try {
            // Execute the SELECT query to get all messages from the chat table
            const [rows] = await connection.execute('SELECT * FROM chat ORDER BY created_at ASC');
            
            // Convert the rows to Message objects
            return (rows as any[]).map(row => ({
                id: row.id,
                content: row.content,
                author: this.validateAuthor(row.author),
                created_at: new Date(row.created_at)
            }));
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    }

    /**
     * Clear all messages from the database
     * @returns Promise<void>
     */
    async clearAllMessages(): Promise<void> {
        const connection = await this.pool.getConnection();
        
        try {
            // Execute the DELETE query to clear the chat table
            await connection.execute('DELETE FROM chat');
        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    }

    /**
     * Validates that the author is either "user" or "assistant"
     * @param author The author string from the database
     * @returns MessageAuthor The validated author
     * @throws Error if the author is not valid
     */
    private validateAuthor(author: string): MessageAuthor {
        if (author === "user" || author === "assistant") {
            return author;
        }
        throw new Error(`Invalid author value: ${author}. Must be either "user" or "assistant".`);
    }

    /**
     * Insert a new message into the database
     * @param content The message content
     * @param author The message author (user or assistant)
     * @returns Promise<Message> The inserted message
     */
    async insertMessage(content: string, author: MessageAuthor): Promise<Message> {
        const connection = await this.pool.getConnection();
        
        try {
            const [result] = await connection.execute(
                'INSERT INTO chat (content, author, created_at) VALUES (?, ?, NOW())',
                [content, author]
            );
            
            const insertResult = result as any;
            return {
                id: insertResult.insertId,
                content,
                author,
                created_at: new Date()
            };
        } finally {
            connection.release();
        }
    }
} 