import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveDefaultBase(command) {
  if (command === 'serve') {
    return '/';
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.npm_package_name || 'invoice-frontend';
  return `/${repoName}/`;
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || resolveDefaultBase(command)
}));
