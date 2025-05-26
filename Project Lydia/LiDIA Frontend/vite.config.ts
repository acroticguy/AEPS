import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for Electron file:// protocol
  build: {
    outDir: 'renderer', // Your existing output directory
  },
});