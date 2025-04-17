import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Default values if environment variables are not set
  const apiHost = env.VITE_API_URL || 'http://localhost:7001';
  
  return {
    plugins: [react()],
    server: {
      port: 7000,
      proxy: {
        '/api': {
          target: `${apiHost}`,
          changeOrigin: true,
        },
      },
    },
    // Define environment variables that will be exposed to the client
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(`${apiHost}`),
    },
  };
}); 