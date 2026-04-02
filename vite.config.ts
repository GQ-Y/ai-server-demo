import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const serverPort = env.SERVER_PORT || '3001';
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['xlsx'],
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
          // 禁用 proxy 缓冲，确保 SSE 实时透传
          configure: (proxy) => {
            proxy.on('proxyReq', (_proxyReq, req) => {
              // SSE 请求不缓冲
              if (req.headers.accept?.includes('text/event-stream')) {
                (req as any).socket?.setTimeout(0);
              }
            });
          },
        },
      },
    },
  };
});
