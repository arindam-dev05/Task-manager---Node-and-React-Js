import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server config. Proxy isn't required since we call the
// full backend URL via VITE_API_URL, but you could add one here.
export default defineConfig({
  plugins: [react()],
});
