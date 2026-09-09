import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "PI_", "NEXT_PUBLIC_", "CLERK_"]);
  const restTarget = env.VITE_SUPABASE_URL || "";
  const chatTarget = String(env.PI_CHAT_URL || "").trim();
  const proxy = {
    ...(restTarget.startsWith("http://")
      ? {
          "/rest": {
            target: restTarget,
            changeOrigin: true,
          },
        }
      : {}),
    ...(chatTarget.startsWith("http://") || chatTarget.startsWith("https://")
      ? {
          "/v1": {
            target: chatTarget,
            changeOrigin: true,
            timeout: 180000,
          },
        }
      : {}),
    "/__clerk": {
      target: "https://frontend-api.clerk.dev",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/__clerk/, "") || "/",
      configure: (httpProxy) => {
        httpProxy.on("proxyReq", (proxyReq) => {
          proxyReq.setHeader(
            "Clerk-Proxy-Url",
            "https://akilli-orman-gozlemcisi-software.vercel.app/__clerk",
          );
          const secret = env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY || "";
          if (secret) proxyReq.setHeader("Clerk-Secret-Key", secret);
          proxyReq.setHeader("X-Forwarded-For", "127.0.0.1");
        });
      },
    },
  };

  return {
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
      proxy,
      warmup: {
        clientFiles: ["./src/main.jsx", "./src/App.jsx", "./src/Home.jsx", "./src/Dashboard.jsx", "./src/Lookout.jsx"],
      },
    },
    preview: {
      allowedHosts: ["127.0.0.1", "localhost"],
      proxy,
    },
  };
});
