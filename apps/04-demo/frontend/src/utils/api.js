/**
 * API configuration utility
 * 
 * This file provides utilities for working with the API, including
 * constructing the base URL and handling common API operations.
 */

// Construct the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint path (e.g., '/logs')
 * @returns {string} The full URL for the endpoint
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Default fetch options for API requests
 */
export const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Handle API errors
 * @param {Response} response - The fetch response
 * @returns {Promise} - Resolves with the JSON data or rejects with an error
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise} - Resolves with the response data
 */
export const apiGet = async (endpoint, params = {}) => {
  const url = new URL(getApiUrl(endpoint));
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  const response = await fetch(url.toString(), {
    ...defaultFetchOptions,
    method: 'GET',
  });
  
  return handleApiResponse(response);
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} - Resolves with the response data
 */
export const apiPost = async (endpoint, data = {}) => {
  const response = await fetch(getApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  return handleApiResponse(response);
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - The API endpoint
 * @returns {Promise} - Resolves with the response data
 */
export const apiDelete = async (endpoint) => {
  const response = await fetch(getApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'DELETE',
  });
  
  return handleApiResponse(response);
}; 