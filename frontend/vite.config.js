import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.warn(`[Vite Proxy Error] ${req?.method || 'REQ'} ${req?.url || ''}:`, err.message);

            if (res && typeof res.writeHead === 'function' && !res.headersSent && !res.writableEnded) {
              try {
                res.writeHead(502, {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store',
                });
                res.end(
                  JSON.stringify({
                    message:
                      err.code === 'ECONNRESET'
                        ? 'Backend connection was reset. The server may be restarting, please try again.'
                        : 'Backend server is unreachable on port 5000. Please ensure the backend is running.',
                    code: err.code || 'PROXY_ERROR',
                  })
                );
              } catch (writeErr) {
                // Ignore socket write failures on aborted streams
              }
            }
          });
        },
      },
    },
  },
});
