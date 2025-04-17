/**
 * Interface for paginated results
 * @template T The type of items in the paginated result
 */
export interface PaginatedResult<T> {
  /**
   * Array of items for the current page
   */
  items: T[];
  
  /**
   * Current page number
   */
  currentPage: number;
  
  /**
   * Number of items per page
   */
  pageSize: number;
  
  /**
   * Total number of items across all pages
   */
  totalItems: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
} 