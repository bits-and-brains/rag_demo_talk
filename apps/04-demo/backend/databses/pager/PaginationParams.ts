/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  /**
   * The page number (1-based)
   */
  page: number;
  
  /**
   * Number of items per page
   */
  pageSize: number;
} 