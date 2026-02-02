import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze' || process.env.ANALYZE === '1'

  return {
    plugins: [
      vue(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 10kb
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false
        }
      },
      chunkSizeWarningLimit: 1200,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            // Vue core
            if (id.includes('/vue/') || id.includes('/@vue/')) {
              return 'vue-vendor'
            }

            // Icons
            if (id.includes('lucide-vue-next')) {
              return 'icons'
            }

            // All BPMN-related packages in one chunk to avoid circular deps
            if (
              id.includes('bpmn') ||
              id.includes('diagram-js') ||
              id.includes('moddle') ||
              id.includes('min-dash') ||
              id.includes('tiny-svg') ||
              id.includes('ids') ||
              id.includes('didi') ||
              id.includes('camunda')
            ) {
              return 'bpmn-vendor'
            }

            // Other vendors
            return 'vendor'
          }
        },
      },
    },
    optimizeDeps: {
      include: [
        'bpmn-js/lib/Modeler',
        'bpmn-js-properties-panel',
        '@bpmn-io/properties-panel'
      ]
    }
  }
})