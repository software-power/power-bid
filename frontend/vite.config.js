import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Configure esbuild to handle JSX in .js files
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.js$/,
        exclude: [],
    },

    // Optimize dependencies to handle JSX in .js files
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },

    // Path aliases to match jsconfig.json
    resolve: {
        alias: {
            src: path.resolve(__dirname, './src'),
        },
    },

    // Build configuration
    build: {
        outDir: 'build', // Match CRA output directory
        sourcemap: false,
        // Optimize chunk size
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },

    // Dev server configuration
    server: {
        port: 3000, // Match CRA default port
        open: true, // Auto-open browser
        host: true, // Listen on all addresses
    },

    // Preview server configuration
    preview: {
        port: 3000,
        host: true,
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
})

