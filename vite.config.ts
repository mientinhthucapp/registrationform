import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'zite-endpoints-sdk': path.resolve(__dirname, 'src/mocks/zite-endpoints-sdk.ts'),
      'zite-file-upload-sdk': path.resolve(__dirname, 'src/mocks/zite-file-upload-sdk.ts'),
    },
  },
  server: { port: 5173 },
});
