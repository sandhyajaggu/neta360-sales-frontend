// Builds the whole app into one self-contained HTML file (dist-demo/index.html) for hosting as a demo link.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { 'import.meta.env.VITE_HASH_ROUTER': JSON.stringify('1') },
  build: { outDir: 'dist-demo', chunkSizeWarningLimit: 2000 },
});
