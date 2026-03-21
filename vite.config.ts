import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'cors-preflight',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'OPTIONS' && req.url?.startsWith('/api')) {
            console.log('[Middleware] Handling OPTIONS preflight:', req.url);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.statusCode = 204;
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('[Proxy] Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Proxy] Response:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, _req, _res) => {
            console.error('[Proxy] Error:', err);
          });
        }
      }
    }
  }
})
