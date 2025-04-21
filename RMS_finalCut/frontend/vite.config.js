import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      "enabled": true,
      provider: 'v8', // Ensure you're using the right coverage provider
      reporter: ['lcov','text', 'json'],
      all:true,
      reportsDirectory: './coverage',
    },
  },
})
