import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/v3/attestation': {
  //       target: 'https://verify.walletconnect.org',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/v3/, '/v3'),
  //     },
  //   },
  // },
  // server: {
  //   host: '0.0.0.0', // 允许外部设备访问
  //   port: 5173, // 指定端口（可自定义）
  //   open: true, // 自动在浏览器中打开
  // },
})
