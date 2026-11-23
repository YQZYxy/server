import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 开发代理目标: 默认 s1 网关, 可用 VITE_GATEWAY_URL 覆盖
const gatewayTarget = process.env.VITE_GATEWAY_URL || 'http://127.0.0.1:38001'
const gatewayWsTarget = gatewayTarget.replace(/^http/, 'ws')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 配置代理到网关
      '/config': {
        target: gatewayTarget,
        changeOrigin: true,
      },
      // 选服列表接口代理到网关
      '/api': {
        target: gatewayTarget,
        changeOrigin: true,
      },
      // WebSocket 代理到网关
      '/ws': {
        target: gatewayWsTarget,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/protobufjs/, /node_modules/],
    },
  },
})
