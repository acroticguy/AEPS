import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      // Adjust rollup options for main process if needed
      rollupOptions: {
        input: {
          index: resolve(__dirname, './src/main/index.ts'),
        },
        output: {
          format: 'cjs', // <--- Force CommonJS for main
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, './src/preload/index.ts'),
        },
        output: {
          format: 'cjs', // <--- Force CommonJS for main
        },
      },
    },
  },
  renderer: {
    plugins: [react()], // Ensure your React plugin is here!
    root: 'src/renderer', // <--- IMPORTANT: Tells Vite where your renderer's source is
    build: {
      outDir: 'out/renderer', // <--- IMPORTANT: This is where Vite will output the built app
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, './src/renderer/index.html'), // <--- Entry HTML
      },
    },
  },
});