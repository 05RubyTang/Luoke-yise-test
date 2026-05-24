import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
// VITE_BASE_PATH 由部署脚本注入：
//   S2测试站：VITE_BASE_PATH=/Yise--assistant-s2/
//   S1测试站：VITE_BASE_PATH=/Luoke-yise-test/
//   生产站：VITE_BASE_PATH=/yise-Luoke-v2.0-ruby-s/
//   Vercel：VITE_BASE_PATH=/ 或 VITE_VERCEL=1（自动用根路径）

/**
 * Vite 插件：build 完成后把 dist/sw.js 里的版本占位符替换为当前构建时间戳。
 * 浏览器通过逐字节对比 sw.js 来判断 SW 是否更新，时间戳变化即可触发完整更新流程。
 */
function swVersionPlugin() {
  return {
    name: 'sw-version-inject',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js')
      if (!fs.existsSync(swPath)) return
      const buildVersion = new Date().toISOString() // e.g. "2026-05-21T03:00:00.000Z"
      const content = fs.readFileSync(swPath, 'utf-8')
      const updated = content.replace('__SW_BUILD_VERSION__', buildVersion)
      fs.writeFileSync(swPath, updated, 'utf-8')
      console.log(`[sw-version] dist/sw.js 版本已注入：${buildVersion}`)
    },
  }
}

export default defineConfig(({ command }) => {
  const isVercel = process.env.VERCEL === '1'
  const basePath = process.env.VITE_BASE_PATH
  return {
    plugins: [react(), swVersionPlugin()],
    base: command === 'build'
      ? (isVercel ? '/' : (basePath || '/Yise--assistant-s2/'))
      : '/',
  }
})
