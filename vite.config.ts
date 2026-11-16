import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Custom plugin to bundle `content.js` (IIFE) and `background.js` (ESM)
 * as self-contained files so Chrome/Edge/Brave/Firefox/Safari Content Scripts
 * never fail with "Cannot use import statement outside a module".
 */
function bundleExtensionScriptsPlugin() {
  return {
    name: 'bundle-extension-scripts',
    async closeBundle() {
      // 1. Bundle Content Script as self-contained IIFE
      await build({
        configFile: false,
        logLevel: 'silent',
        define: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
        resolve: {
          alias: { '@': resolve(__dirname, 'src') },
        },
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'ProjectXContentScript',
            formats: ['iife'],
            fileName: () => 'content.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
      });

      // 2. Bundle Background Service Worker as self-contained ES module
      await build({
        configFile: false,
        logLevel: 'silent',
        define: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
        resolve: {
          alias: { '@': resolve(__dirname, 'src') },
        },
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/background/index.ts'),
            formats: ['es'],
            fileName: () => 'background.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), bundleExtensionScriptsPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        options: resolve(__dirname, 'options.html'),
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
