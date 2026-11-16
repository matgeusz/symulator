import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base './' – ścieżki względne, więc aplikacja działa na GitHub Pages pod
// https://<user>.github.io/<repo>/ oraz lokalnie bez zmian w konfiguracji.
// W razie potrzeby można wymusić inną wartość: VITE_BASE=/moje-repo/ npm run build
const base = process.env.VITE_BASE ?? './'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
