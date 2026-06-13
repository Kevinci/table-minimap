import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'demo',
  base: '/table-minimap/',
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '../src': resolve(__dirname, 'src'),
    },
  },
});
