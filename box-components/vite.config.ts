import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { liveEditPlugin } from './liveedit.vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        configFile: './babel.config.cjs'
      }
    }),
    liveEditPlugin()
  ]
});