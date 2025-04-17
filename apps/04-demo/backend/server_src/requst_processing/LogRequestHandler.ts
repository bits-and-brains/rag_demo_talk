import { Request, Response } from 'express';
import { LogRepository } from '../../databses/repositories/LogRepository';
import { PaginationParams } from '../../databses/pager';

/**
 * Handler for log-related requests
 */
export class LogRequestHandler {
    private logRepository: LogRepository;

    constructor() {
        this.logRepository = new LogRepository();
    }

    /**
     * Process a request to get logs with pagination
     * @param req Express request object
     * @param res Express response object
     */
    async processRequest(req: Request, res: Response): Promise<void> {
        try {            
            // Extract pagination parameters from query
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            
            // Validate pagination parameters
            if (page < 1) {
                res.status(400).json({ error: 'Page number must be greater than 0' });
                return;
            }
            
            if (pageSize < 1 || pageSize > 100) {
                res.status(400).json({ error: 'Page size must be between 1 and 100' });
                return;
            }
            
            const paginationParams: PaginationParams = { page, pageSize };
            
            // Get logs with pagination
            const result = await this.logRepository.findAll(paginationParams);
            
            // Return paginated result
            res.status(200).json(result);
        } catch (error) {
            console.error('Error retrieving logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
