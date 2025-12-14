import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf']
  },
  // Cette partie aide à résoudre certains problèmes de chargement PDF
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})