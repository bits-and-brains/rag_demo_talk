import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { Log, LogSeverity } from '../models/Log';
import { PaginationParams, PaginatedResult, calculateOffset, createPaginatedResult } from '../pager';

// Load environment variables
dotenv.config();

/**
 * Repository class for handling Log database operations
 */
export class LogRepository {
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
   * Get all logs with pagination
   * @param params Pagination parameters
   * @returns Promise<PaginatedResult<Log>> Paginated logs
   */
  async findAll(params: PaginationParams): Promise<PaginatedResult<Log>> {
    const connection = await this.pool.getConnection();
    const offset = calculateOffset(params);
    
    try {
      // Get total count
      const [countResult] = await connection.query('SELECT COUNT(*) as count FROM logs');
      const totalItems = (countResult as any[])[0].count;

      // Get paginated results using query instead of execute
      const [rows] = await connection.query(
        'SELECT * FROM logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [params.pageSize, offset]
      );
      
      const logs = (rows as any[]).map(row => ({
        id: row.id,
        content: row.content,
        logger: row.logger,
        severity: this.validateSeverity(row.severity),
        created_at: new Date(row.created_at)
      }));

      return createPaginatedResult(logs, params, totalItems);
    } finally {
      connection.release();
    }
  }


  /**
   * Validates that the severity is a valid LogSeverity
   * @param severity The severity string from the database
   * @returns LogSeverity The validated severity
   * @throws Error if the severity is not valid
   */
  private validateSeverity(severity: string): LogSeverity {
    if (severity === "info" || severity === "warning" || severity === "error" || severity === "debug") {
      return severity as LogSeverity;
    }
    throw new Error(`Invalid severity value: ${severity}. Must be one of: "info", "warning", "error", "debug".`);
  }

  /**
   * Create a new log entry
   * @param log Log data to create
   * @returns Promise<Log> Created log with ID
   */
  async create(log: Omit<Log, 'id' | 'created_at'>): Promise<Log> {
    const connection = await this.pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO logs (content, logger, severity) VALUES (?, ?, ?)',
        [log.content, log.logger, log.severity]
      );
      
      const insertId = (result as any).insertId;
      
      // Get the created log
      const [rows] = await connection.query('SELECT * FROM logs WHERE id = ?', [insertId]);
      const row = (rows as any[])[0];
      
      return {
        id: row.id,
        content: row.content,
        logger: row.logger,
        severity: this.validateSeverity(row.severity),
        created_at: new Date(row.created_at)
      };
    } finally {
      connection.release();
    }
  }
} 