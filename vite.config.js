import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function getGitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/invoice-frontend/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION || packageJson.version),
    __BUILD_TIME__: JSON.stringify(process.env.VITE_BUILD_TIME || new Date().toISOString()),
    __GIT_SHA__: JSON.stringify(process.env.VITE_GIT_SHA || getGitSha()),
  },
});
