import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ueca-react',
      fileName: 'ueca-react',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'mobx', 'mobx-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          mobx: 'mobx',
          'mobx-react': 'mobxReact'
        }
      }
    },
    sourcemap: false
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
      include: ['src/**/*'],
      exclude: ['src/__tests__/**/*']
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts'
  }
})
