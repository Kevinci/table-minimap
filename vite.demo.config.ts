import { defineConfig } from 'vite';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  root: 'demo',
  base: '/table-minimap/',
  define: {
    __TM_DEMO_VERSION__: JSON.stringify(pkg.version),
  },
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
