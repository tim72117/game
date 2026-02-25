import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api/antigravity': {
                target: 'http://localhost:5176',
                changeOrigin: true
            }
        }
    }
});
