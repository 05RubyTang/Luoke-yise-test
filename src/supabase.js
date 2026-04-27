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
    // 改用 implicit 流：邮件链接直接携带 access_token（hash 片段）
    // PKCE 流的 code_verifier 存在发起浏览器的 localStorage，跨浏览器打开链接时找不到 verifier 导致失败
    // implicit 流无需 verifier，任何浏览器打开链接都能直接换取 session
    flowType: 'implicit',
    // 持久化 session 到 localStorage
    persistSession: true,
    // 自动刷新过期 token
    autoRefreshToken: true,
  },
});
