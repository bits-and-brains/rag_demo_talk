# RAG Demo Frontend

This is the frontend application for the RAG Demo project.

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_HOST` | The host of the API server | `http://localhost` |
| `API_PORT` | The port of the API server | `7001` |
| `VITE_API_URL` | The full URL of the API server (constructed from `API_HOST` and `API_PORT`) | `http://localhost:7001` |

## Development

To start the development server:

```bash
npm install
npm run dev
```

The development server will start on port 7000 by default.

## API Configuration

The application is configured to proxy API requests to the backend server. The proxy configuration is set up in `vite.config.js` and uses the environment variables from the `.env` file.

If you need to change the API server location, update the `.env` file with the appropriate values for `API_HOST` and `API_PORT`.

## API Utilities

The application includes utility functions for making API requests in `src/utils/api.js`. These functions handle common API operations and error handling.

Example usage:

```javascript
import { apiGet, apiPost } from '../utils/api';

// GET request
const data = await apiGet('logs', { page: 1, pageSize: 10 });

// POST request
const response = await apiPost('chat', { message: 'Hello, world!' });
``` 