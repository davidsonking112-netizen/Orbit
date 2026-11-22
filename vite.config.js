import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Orbit/' : '/',
  server: {
    allowedHosts: true,
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
});
