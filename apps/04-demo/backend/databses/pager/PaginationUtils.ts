import { PaginationParams, PaginatedResult } from './index';

/**
 * Calculate the offset for SQL queries based on pagination parameters
 * @param params Pagination parameters
 * @returns The offset value for SQL queries
 */
export function calculateOffset(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}

/**
 * Calculate the total number of pages based on total items and page size
 * @param totalItems Total number of items
 * @param pageSize Number of items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Create a paginated result object
 * @param items Array of items for the current page
 * @param params Pagination parameters
 * @param totalItems Total number of items across all pages
 * @returns A paginated result object
 */
export function createPaginatedResult<T>(
  items: T[],
  params: PaginationParams,
  totalItems: number
): PaginatedResult<T> {
  const totalPages = calculateTotalPages(totalItems, params.pageSize);
  
  return {
    items,
    currentPage: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages
  };
} 