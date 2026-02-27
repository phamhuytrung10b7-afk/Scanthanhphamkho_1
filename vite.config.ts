import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // Quan trọng nhất: Đảm bảo build ra đường dẫn tương đối để Electron đọc được
    base: './', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    
    resolve: {
      alias: {
        // Sử dụng path.resolve để tránh lỗi đường dẫn trên các hệ điều hành khác nhau
        '@': path.resolve(__dirname, './'),
      }
    },

    // Thêm cấu hình build để tối ưu cho Electron
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
    }
  };
});