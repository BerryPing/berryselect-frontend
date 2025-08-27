// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // import '@/...' 가능
    },
  },
  server: {
    port: 5173, // 기본값, 필요시 변경
    open: true, // dev 서버 기동 시 브라우저 자동 오픈 (선택)
    proxy: {
      // 프론트에서 /api 로 호출하면 백엔드(스프링 8080)로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 필요 시 프리픽스 제거:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true, // 배포 디버깅 원하면 유지, 아니면 false
  },
});