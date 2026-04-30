import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE_PATH 由部署脚本注入：
//   测试站：VITE_BASE_PATH=/Luoke-yise-test/
//   生产站：VITE_BASE_PATH=/yise-Luoke-v2.0-ruby-s/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build'
    ? (process.env.VITE_BASE_PATH || '/yise-Luoke-v2.0-ruby-s/')
    : '/',
}))
