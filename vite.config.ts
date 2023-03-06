import react from "@vitejs/plugin-react"
import {defineConfig} from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import checker from "vite-plugin-checker"

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
    checker({
      typescript: true
    })
  ]
})
