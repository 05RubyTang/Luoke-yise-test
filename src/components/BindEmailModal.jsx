import { useState, useEffect, useRef } from 'react';
import { supabase, APP_BASE_URL } from '../supabase';
import { useStore } from '../store';

// 流程说明（implicit 流，邮件链接携带 access_token，任何浏览器打开均可）：
//   bind / login / otp_recover → 统一使用 signInWithOtp 发魔法链接
//   implicit 流下无需 code_verifier，跨浏览器（微信→Safari/邮箱App）完全兼容
//   store 的 hydrateFromCloud 通过 pending_bind_email 反查旧数据并合并

async function sendOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: APP_BASE_URL,
      // shouldCreateUser: true 为默认值，首次绑定自动创建 email 用户
    },
  });
  if (error) throw error;
}

// 检测是否在微信内置浏览器
function isWechatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

const RESEND_CD = 60; // 重发冷却秒数

export default function BindEmailModal({ onClose, onSuccess }) {
  const { forceSyncNow } = useStore();
  const [step, setStep] = useState('input');       // 'input' | 'sent'
  const [mode, setMode] = useState('bind');        // 'bind' | 'login' | 'otp_recover'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCd, setResendCd] = useState(0);    // 重发倒计时（秒）
  const cdRef = useRef(null);
  const inWechat = isWechatBrowser();

  // 倒计时
  useEffect(() => {
    if (resendCd <= 0) return;
    cdRef.current = setInterval(() => {
      setResendCd(v => {
        if (v <= 1) { clearInterval(cdRef.current); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(cdRef.current);
  }, [resendCd > 0]);  // 只在变成正数时启动

  // 点击「发送」
  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 发邮件前静默强制同步到云端，并把目标邮箱写入 pending_bind_email
      // 微信用户点击邮件链接会跳到 Safari，Safari localStorage 是空的
      // pending_bind_email 让 hydrateFromCloud 可以按邮箱反查旧 uid 的数据
      await forceSyncNow(trimmed);

      // 所有模式统一使用 signInWithOtp（implicit 流）
      // 原因：updateUser 在跨浏览器场景（邮箱App、Safari）打开确认链接时会产生新 uid，
      //       导致旧数据找不到。signInWithOtp + implicit 流直接在链接里携带 token，
      //       任何浏览器打开均可，store 的 hydrateFromCloud 会通过 pending_bind_email 恢复旧数据
      await sendOtp(trimmed);

      setStep('sent');
      setResendCd(RESEND_CD); // 进入已发送后启动冷却
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Auth session missing')) {
        setError('初始化中，请稍候 3 秒再试');
      } else if (msg.toLowerCase().includes('rate limit') || msg.includes('too many')) {
        setError('发送太频繁，请稍后再试');
      } else {
        setError(msg || '发送失败，请检查网络后重试');
      }
    } finally {
      setLoading(false);
    }
  }

  // 发送成功后的文案
  const sentDesc = mode === 'otp_recover'
    ? '该邮箱已有账号。点击邮件中的链接，即可登录并在此设备恢复所有数据。'
    : mode === 'bind'
    ? '点击邮件中的链接，即可完成邮箱绑定，数据将永久保存并可跨设备恢复。'
    : '点击邮件中的链接，即可登录并恢复你的全部数据。';

  const sentTitle = mode === 'otp_recover' ? '📬 请点击邮件链接登录' : '📬 邮件已发送';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* ── 步骤一：输入邮箱 ── */}
        {step === 'input' && (
          <>
            <div className="modal-header">
              <h3>{mode === 'bind' ? '📧 绑定邮箱' : '🔑 找回账号'}</h3>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                {mode === 'bind'
                  ? '绑定邮箱后，换手机或重装也能一键恢复全部数据，历史记录和收集进度一条不丢。'
                  : '输入你之前绑定的邮箱，点击邮件链接即可在此设备恢复数据。'}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>邮箱地址</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com"
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                {error && <div className="form-error">⚠️ {error}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  {loading ? '发送中…' : mode === 'bind' ? '发送确认邮件' : '发送登录链接'}
                </button>
              </form>

              {/* 模式切换 */}
              <div className="modal-switch">
                {mode === 'bind' ? (
                  <span>
                    换设备或之前已绑定？
                    <button className="link-btn"
                      onClick={() => { setMode('login'); setError(''); }}>
                      找回已有账号
                    </button>
                  </span>
                ) : (
                  <button className="link-btn"
                    onClick={() => { setMode('bind'); setError(''); }}>
                    ← 绑定新邮箱
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── 步骤二：邮件已发送 ── */}
        {step === 'sent' && (
          <>
            <div className="modal-header">
              <h3>{sentTitle}</h3>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div className="sent-icon">✉️</div>

              {/* otp_recover 额外说明 */}
              {mode === 'otp_recover' && (
                <div className="form-error" style={{
                  marginBottom: 12,
                  background: 'rgba(200,131,10,0.08)',
                  borderColor: 'rgba(200,131,10,0.3)',
                  color: 'var(--gold)',
                }}>
                  ℹ️ 该邮箱已注册过账号，我们已自动切换为「找回登录」模式
                </div>
              )}

              <p className="modal-desc">
                已向 <strong>{email}</strong> 发送邮件
              </p>
              <p className="modal-desc">{sentDesc}</p>

              {/* 微信用户专属提示 */}
              {inWechat && (
                <div style={{
                  margin: '12px 0',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F0FFF4',
                  border: '1.5px solid rgba(75,156,70,0.35)',
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#3D8B3D', marginBottom: 5 }}>
                    📱 微信用户必读
                  </div>
                  <div style={{ fontSize: 11, color: '#2E7D32', lineHeight: 1.7 }}>
                    邮件链接会在<strong>系统浏览器（Safari）</strong>中打开，这是正常现象。<br />
                    你的数据已在发送前备份到云端，在 Safari 里点击链接后会<strong>自动恢复</strong>所有记录。
                  </div>
                </div>
              )}

              <div className="sent-tips">
                <p>⏳ 邮件通常在 <strong>1 分钟内</strong>送达，请耐心等待</p>
                <p>📌 没收到？请检查垃圾邮件箱</p>
                <p>🔗 链接 60 分钟内有效，过期需重新发送</p>
              </div>

              <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: 16, opacity: resendCd > 0 ? 0.55 : 1 }}
                disabled={resendCd > 0}
                onClick={() => { setStep('input'); setError(''); }}
              >
                {resendCd > 0 ? `重新发送（${resendCd}s）` : '重新发送'}
              </button>

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => onSuccess?.(email)}
              >
                好的，我去查邮件
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
