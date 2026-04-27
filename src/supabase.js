import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 计算 App 的 base URL（用于邮件链接跳回）
// 本地：http://localhost:5173/
// 生产：https://05rubytang.github.io/yise-Luoke-v2.0-ruby-s/
export const APP_BASE_URL = window.location.origin + import.meta.env.BASE_URL;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动从 URL hash / query 中提取 token（邮件链接跳回时必须）
    detectSessionInUrl: true,
    // 使用 PKCE 流（更安全，且兼容 SPA 刷新后 session 不丢失）
    flowType: 'pkce',
    // 持久化 session 到 localStorage
    persistSession: true,
    // 自动刷新过期 token
    autoRefreshToken: true,
  },
});
