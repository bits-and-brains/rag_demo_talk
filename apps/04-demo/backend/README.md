# RAG Demo Backend

This is the backend application for the RAG Demo project.

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port on which the server will listen | `7001` |
| `DB_HOST` | The host of the database | `localhost` |
| `DB_PORT` | The port of the database | `7011` |
| `DB_NAME` | The name of the database | `rag_demo` |
| `DB_USER` | The username for the database | `rag_user` |
| `DB_PASSWORD` | The password for the database | `rag_password` |
| `CORS_ENABLED` | Whether CORS is enabled | `true` |
| `CORS_ORIGIN` | The allowed origin for CORS | `http://localhost:7000` |

## CORS Configuration

The backend supports Cross-Origin Resource Sharing (CORS) to allow requests from the frontend application. The CORS configuration is controlled by the following environment variables:

- `CORS_ENABLED`: Set to `true` to enable CORS, `false` to disable it.
- `CORS_ORIGIN`: The origin that is allowed to make requests to the backend. This should be set to the URL of the frontend application.

By default, CORS is enabled and allows requests from `http://localhost:7000`, which is the default URL of the frontend development server.

## Development

To start the development server:

```bash
npm install
npm start
```

The server will start on the port specified in the `PORT` environment variable (default: 7001). 