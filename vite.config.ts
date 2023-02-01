import react from "@vitejs/plugin-react"
import analyze from "rollup-plugin-analyzer"
import {defineConfig} from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },
  preview: {
    port: 8080
  },
  plugins: [
    react(),
    tsconfigPaths(),
    analyze({
      summaryOnly: true
    })
  ]
})
