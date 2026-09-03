import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["leaflet", "react", "react-dom", "@supabase/supabase-js", "react-router-dom"],
  },
  server: {
    allowedHosts: ["127.0.0.1", "localhost"],
    warmup: {
      clientFiles: ["./src/main.jsx", "./src/App.jsx", "./src/Home.jsx", "./src/Dashboard.jsx", "./src/Lookout.jsx"],
    },
  },
  preview: {
    allowedHosts: ["127.0.0.1", "localhost"],
  },
});
