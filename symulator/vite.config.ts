import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serwuje projekt pod https://<user>.github.io/<NAZWA_REPOZYTORIUM>/
// - w CI (GitHub Actions) base wynika z nazwy repozytorium (zmienna GITHUB_REPOSITORY),
// - lokalnie (npm run dev / build) base to '/'; można go wymusić zmienną VITE_BASE, np. VITE_BASE=/moje-repo/
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE ?? (repo ? `/${repo}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
