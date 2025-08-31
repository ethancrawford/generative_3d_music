import { defineConfig } from 'vite'

export default defineConfig({
  // Set the root to current directory since your main.js is in src/
  root: '.',

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',

    // Entry point - Vite will look for index.html by default
    rollupOptions: {
      input: 'src/main.js',
      output: {
        // Generate bundle.js to match your current setup
        entryFileNames: 'bundle.js',
        // Disable code splitting to get a single bundle file
        manualChunks: undefined,
      }
    },

    // Enable/disable minification based on mode
    minify: true,

    // Generate sourcemaps
    sourcemap: true,

    // Target modern browsers (equivalent to your es2020)
    target: 'es2020',

    // Clear output directory before build
    emptyOutDir: true
  },

  // Development server configuration
  server: {
    // You can configure port, host, etc. here if needed
    port: 3000,
    open: false // Set to true if you want browser to open automatically
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      scss: {
        // Sass options - Vite will automatically find and compile main.scss
        // You can add additional Sass options here if needed
      }
    },
    devSourcemap: true // Enable CSS sourcemaps in dev
  },

  // Define environment variables (replaces your define config)
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },

  // Public directory (for static assets)
  publicDir: 'public'
})
