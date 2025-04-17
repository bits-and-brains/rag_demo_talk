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
   * Find logs with filters and pagination
   * @param params Parameters including pagination and filters
   * @returns Promise<PaginatedResult<Log>> Paginated filtered logs
   */
  async findFiltered(params: PaginationParams & { filters?: any }): Promise<PaginatedResult<Log>> {
    const connection = await this.pool.getConnection();
    const offset = calculateOffset(params);
    
    try {
      // Build the WHERE clause based on filters
      let whereClause = '';
      const queryParams: any[] = [];
      
      if (params.filters) {
        const conditions: string[] = [];
        
        // Handle severity filters
        if (params.filters.severity) {
          if (params.filters.severity.include && params.filters.severity.include.length > 0) {
            const placeholders = params.filters.severity.include.map(() => '?').join(', ');
            conditions.push(`severity IN (${placeholders})`);
            queryParams.push(...params.filters.severity.include);
          }
          
          if (params.filters.severity.exclude && params.filters.severity.exclude.length > 0) {
            const placeholders = params.filters.severity.exclude.map(() => '?').join(', ');
            conditions.push(`severity NOT IN (${placeholders})`);
            queryParams.push(...params.filters.severity.exclude);
          }
        }
        
        // Handle logger filter
        if (params.filters.logger) {
          conditions.push('logger = ?');
          queryParams.push(params.filters.logger);
        }
        
        // Handle created_at filters
        if (params.filters.created_at) {
          if (params.filters.created_at.before) {
            conditions.push('created_at < ?');
            queryParams.push(params.filters.created_at.before);
          }
          
          if (params.filters.created_at.after) {
            conditions.push('created_at > ?');
            queryParams.push(params.filters.created_at.after);
          }
          
          if (params.filters.created_at.range) {
            conditions.push('created_at BETWEEN ? AND ?');
            queryParams.push(params.filters.created_at.range.start, params.filters.created_at.range.end);
          }
        }
        
        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      // Get total count with filters
      let countQuery = 'SELECT COUNT(*) as count FROM logs';
      if (whereClause) {
        countQuery += ` ${whereClause}`;
      }
      
      const [countResult] = await connection.query(countQuery, queryParams);
      const totalItems = (countResult as any[])[0].count;
      
      // Get paginated results with filters
      let query = 'SELECT * FROM logs';
      if (whereClause) {
        query += ` ${whereClause}`;
      }
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      
      const [rows] = await connection.query(query, [...queryParams, params.pageSize, offset]);
      
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