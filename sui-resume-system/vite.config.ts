import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// 自定义插件设置 WASM MIME 类型
function wasmMimeTypePlugin() {
  return {
    name: 'wasm-mime-type',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasmMimeTypePlugin() // 添加自定义插件
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@mysten/walrus'],
    include: ['dataloader']
  },
  build: {
    target: 'esnext',
  }
})