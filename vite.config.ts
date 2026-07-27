import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/prototipo_d20_jogavel/' : '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
}));
