/**
 * 抓取洛克王国 BWIKI 精灵图鉴页面
 * 提取精灵名 → 立绘图片URL 的映射，输出为 JS 文件
 * 
 * 用法：node demo/scripts/fetch-wiki-spirits.mjs
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIKI_URL = 'https://wiki.biligame.com/rocom/%E7%B2%BE%E7%81%B5%E5%9B%BE%E9%89%B4';

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractSpirits(html) {
  const spirits = {};
  
  // 匹配精灵条目：每个精灵有一个立绘图 img，alt 属性含「页面 宠物 立绘 {精灵名} 1.png」
  // img src 格式：patchwiki.biligame.com/images/rocom/thumb/.../360px-页面_宠物_立绘_{名字}_1.png
  // 同时页面中精灵名出现在紧邻的 a[title] 或 alt 里
  
  // 策略：匹配所有「页面 宠物 立绘 {name} 1.png」的 alt 和 src
  const imgRegex = /alt="页面 宠物 立绘 (.+?) 1\.png"[^>]*src="([^"]+)"/g;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    let name = match[1];
    const thumbUrl = match[2];
    
    // 把缩略图 URL 转为原图 URL
    // 缩略图：.../thumb/a/ab/hash.png/360px-filename.png
    // 原图：  .../a/ab/hash.png
    const originalUrl = thumbUrl.replace(/\/thumb(\/.+?\/.+?\/.+?\.png)\/.+$/, '$1');
    
    // 提取精灵基础名（去掉括号里的形态描述，只保留基础名用作 key）
    const baseName = name.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '').trim();
    
    // 去重：同一精灵可能有多个形态，优先保留「不带括号」的原版
    if (!spirits[baseName]) {
      spirits[baseName] = originalUrl;
    } else if (!name.includes('（') && !name.includes('(')) {
      // 如果新出现的是不带括号的（更通用），覆盖
      spirits[baseName] = originalUrl;
    }
    
    // 带括号的形态也单独存入（完整名字）
    if (name !== baseName) {
      if (!spirits[name]) {
        spirits[name] = originalUrl;
      }
    }
  }
  
  return spirits;
}

async function main() {
  console.log('正在抓取精灵图鉴页面...');
  const html = await fetchPage(WIKI_URL);
  
  console.log('解析精灵数据...');
  const spirits = extractSpirits(html);
  
  const count = Object.keys(spirits).length;
  console.log(`共提取 ${count} 条精灵数据`);
  
  // 按名字排序
  const sorted = Object.fromEntries(
    Object.entries(spirits).sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
  );
  
  // 输出为 JS 模块
  const outPath = resolve(__dirname, '../src/data/spirits-wiki.js');
  const content = `// 自动生成 - 来源：https://wiki.biligame.com/rocom/精灵图鉴
// 生成时间：${new Date().toLocaleString('zh-CN')}
// 精灵名 → BWIKI 立绘图片 URL（作为本地图片不存在时的兜底）
export const SPIRITS_WIKI_IMG = ${JSON.stringify(sorted, null, 2)};

// 通过精灵名获取 wiki 图片 URL
export function getWikiSpiritImg(name) {
  return SPIRITS_WIKI_IMG[name] || null;
}
`;
  
  writeFileSync(outPath, content, 'utf-8');
  console.log(`已写入 ${outPath}`);
  
  // 打印前10条预览
  console.log('\n前10条预览：');
  Object.entries(sorted).slice(0, 10).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
}

main().catch(err => {
  console.error('错误：', err);
  process.exit(1);
});
