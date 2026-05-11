import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const defaultBase = repoName ? `/${repoName}/` : '/invoice-frontend/';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || defaultBase
});
