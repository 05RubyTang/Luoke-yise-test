import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { supabase } from '../supabase';
import BindEmailModal from '../components/BindEmailModal';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';
import { PLANS, ALL_SHINIES } from '../data/plans';

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} · ${hh}:${mi}`;
}

function parseNonNeg(str) {
  const n = parseInt(str.trim(), 10);
  return (str.trim() !== '' && !isNaN(n) && n >= 0) ? n : null;
}

// ─── 历史卡片（从 History.jsx 迁移，保持完全一致）──────────────────────────

function HistoryCard({ task, index }) {
  const { dispatch } = useStore();
  const plan = PLANS.find(p => p.id === task.planId);
  const isManual = task.resultType === 'manual';
  const isSuccess = task.resultType !== 'abandoned';
  const isPool = task.resultType === 'pool';
  const breakdowns = task.breakdowns || {};
  const polluted = breakdowns.polluted || 0;
  const original = breakdowns.original || 0;
  const shiny = breakdowns.shiny || 0;

  const [editing, setEditing] = useState(false);
  const [inputs, setInputs] = useState({
    shieldBreakCount: '',
    polluted: '',
    original: '',
    ballsUsed: '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openEdit = () => {
    setConfirmDelete(false);
    setInputs({
      shieldBreakCount: task.shieldBreakCount != null ? String(task.shieldBreakCount) : '',
      polluted: String(polluted),
      original: String(original),
      ballsUsed: task.ballsUsed != null ? String(task.ballsUsed) : '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    const sbc = parseNonNeg(inputs.shieldBreakCount);
    const pol = parseNonNeg(inputs.polluted);
    const ori = parseNonNeg(inputs.original);
    const bal = parseNonNeg(inputs.ballsUsed);
    dispatch({
      type: 'UPDATE_COMPLETED_STATS',
      taskId: task.id,
      shieldBreakCount: sbc ?? task.shieldBreakCount,
      polluted: pol ?? polluted,
      original: ori ?? original,
      ballsUsed: bal,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_COMPLETED_TASK', taskId: task.id });
  };

  const setField = (field, val) => setInputs(prev => ({ ...prev, [field]: val }));

  return (
    <div className="card animate-in" style={{ animationDelay: `${index * 0.04}s` }}>
      {/* 顶部行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#F0E8D5', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {isSuccess
            ? <SpiritAvatar name={task.resultSpirit} obtained size={44} showName={false} />
            : plan ? <PlanIcon plan={plan} size={30} /> : <span style={{ fontSize: 22 }}>?</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: isSuccess ? '#2B2A2E' : '#A09080',
            marginBottom: 3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isSuccess ? task.resultSpirit : `${plan?.type || '?'}方案 · 未完成`}
          </div>
          <div style={{ fontSize: 11, color: '#A09080', fontWeight: 500 }}>
            {formatDateTime(task.completedAt)}
          </div>
        </div>
        <button
          onClick={editing ? () => setEditing(false) : openEdit}
          style={{
            flexShrink: 0,
            border: editing ? '1px solid rgba(103,93,83,0.3)' : '1px solid rgba(103,93,83,0.25)',
            background: editing ? '#F0E8D5' : 'var(--card-inner)',
            borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700,
            color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >{editing ? '✕ 取消' : '✎ 编辑'}</button>
        <button
          onClick={() => { setEditing(false); setConfirmDelete(v => !v); }}
          style={{
            flexShrink: 0,
            border: confirmDelete ? '1px solid rgba(200,53,26,0.5)' : '1px solid rgba(200,53,26,0.25)',
            background: confirmDelete ? '#FFF2EF' : 'var(--card-inner)',
            borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700,
            color: '#C8351A', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >🗑</button>
      </div>

      {/* 删除确认 */}
      {confirmDelete && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#FFF2EF', borderRadius: 8, padding: '8px 12px', marginBottom: 10,
          border: '1px solid rgba(200,53,26,0.2)',
        }}>
          <span style={{ fontSize: 11, color: '#C8351A', fontWeight: 700 }}>
            确定删除这条记录？{isSuccess && task.resultSpirit ? `（若无其他「${task.resultSpirit}」记录，将恢复为未解锁）` : ''}
          </span>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
            <button onClick={handleDelete} style={{
              padding: '4px 12px', borderRadius: 6,
              border: '1.5px solid #C8351A', background: '#C8351A', color: '#fff',
              fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>删除</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              padding: '4px 10px', borderRadius: 6,
              border: '1px solid rgba(103,93,83,0.25)', background: 'var(--card-inner)', color: 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>取消</button>
          </div>
        </div>
      )}

      {/* 出货标签 */}
      {isSuccess && (
        <div style={{
          background: isManual ? '#5D4037' : isPool ? '#2B2A2E' : '#7E57C2',
          borderRadius: 8, padding: '6px 12px', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {!isManual && plan && <PlanIcon plan={plan} size={16} style={{ filter: 'brightness(2)' }} />}
          {isManual && <span style={{ fontSize: 13 }}>✍️</span>}
          <span style={{
            fontSize: 12, fontWeight: 800, color: '#FBF7EC',
            fontFamily: 'var(--font-display)', letterSpacing: 1,
          }}>
            {isManual ? '手动补录' : isPool ? `${plan?.type || ''}方案出货` : '歪池出货'}
          </span>
          {task.note && (
            <span style={{ fontSize: 10, color: 'rgba(251,247,236,0.75)', fontWeight: 500, marginLeft: 2 }}>
              · {task.note}
            </span>
          )}
        </div>
      )}

      {/* 数据网格：manual 类型只显示球数 */}
      {isManual ? (
        <div style={{
          background: '#F0E8D5', borderRadius: 10, overflow: 'hidden', marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10px 0',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#2B2A2E', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {task.ballsUsed != null ? task.ballsUsed : '—'}
            </div>
            <div style={{ fontSize: 9, color: '#A09080', marginTop: 4, fontWeight: 600 }}>消耗球数</div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: '#F0E8D5', borderRadius: 10, overflow: 'hidden', marginBottom: 8,
        }}>
          {[
            { label: '触发污染次数', value: task.shieldBreakCount ?? '—', color: '#D4560A' },
            { label: '污染精灵', value: polluted, color: '#8B4BB8' },
            { label: '原色精灵', value: original, color: '#4B9C46' },
            { label: '消耗球数', value: task.ballsUsed != null ? task.ballsUsed : '—', color: '#2B2A2E' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '10px 4px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(103,93,83,0.12)' : 'none',
            }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: item.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {item.value}
              </div>
              <div style={{ fontSize: 9, color: '#A09080', marginTop: 4, fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑面板 */}
      {editing && (
        <div style={{
          background: '#F0E8D5', borderRadius: 10,
          padding: '12px 12px 10px', marginBottom: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>
            修改数据
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', marginBottom: 10 }}>
            {(isManual ? [
              { field: 'ballsUsed', label: '消耗球数', placeholder: '个', color: '#2B2A2E' },
            ] : [
              { field: 'shieldBreakCount', label: '触发污染次数', placeholder: '次数', color: '#D4560A' },
              { field: 'polluted', label: '污染精灵', placeholder: '只', color: '#8B4BB8' },
              { field: 'original', label: '原色精灵', placeholder: '只', color: '#4B9C46' },
              { field: 'ballsUsed', label: '消耗球数', placeholder: '个', color: '#2B2A2E' },
            ]).map(({ field, label, placeholder, color }) => (
              <div key={field}>
                <div style={{ fontSize: 9, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
                <input
                  type="number" inputMode="numeric" min="0"
                  value={inputs[field]}
                  onChange={e => setField(field, e.target.value)}
                  placeholder={placeholder}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '7px 10px', borderRadius: 7,
                    border: `1.5px solid ${color}44`,
                    background: '#FBF7EC',
                    fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-display)',
                    color, outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} style={{
            width: '100%', padding: '10px 0',
            border: '2px solid #2B2A2E', borderRadius: 'var(--radius-sm)',
            background: '#2B2A2E', color: '#FBF7EC',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 2px 0 #111014',
          }}>保存修改</button>
        </div>
      )}

      {/* 标签行 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {isManual ? (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(93,64,55,0.08)', color: '#5D4037',
            border: '1px solid rgba(93,64,55,0.2)',
          }}>✍️ 手动补录</span>
        ) : (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(212,86,10,0.08)', color: '#D4560A',
            border: '1px solid rgba(212,86,10,0.2)',
          }}>💀 触发污染 {task.shieldBreakCount ?? '—'}</span>
        )}
        {!isManual && polluted > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(139,75,184,0.08)', color: '#8B4BB8',
            border: '1px solid rgba(139,75,184,0.2)',
          }}>污染精灵 {polluted}</span>
        )}
        {!isManual && original > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(75,156,70,0.08)', color: '#4B9C46',
            border: '1px solid rgba(75,156,70,0.2)',
          }}>原色精灵 {original}</span>
        )}
        {!isManual && shiny > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(200,131,10,0.10)', color: '#C8830A',
            border: '1px solid rgba(200,131,10,0.25)',
          }}>✨ 异色精灵 {shiny}</span>
        )}
      </div>
    </div>
  );
}

// ─── 已移至 ManualShinyPage.jsx ───────────────────────────────────────────────

// 分区标题组件（HistoryCard 内部使用）
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
      marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

// ─── 「我的」主页面 ───────────────────────────────────────────────────────────

// ─── 用户名 Hook ──────────────────────────────────────────────────────────────

const USERNAME_KEY = 'lk_username';

function genDefaultName() {
  // 「小洛克」+ 4位随机数字
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `小洛克${suffix}`;
}

function useUsername() {
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved) return saved;
    const name = genDefaultName();
    localStorage.setItem(USERNAME_KEY, name);
    return name;
  });
  const [nameSaving, setNameSaving] = useState(false);

  // userId 有值时额外写 Supabase
  const saveUsername = async (name, userId) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    // 先写本地
    localStorage.setItem(USERNAME_KEY, trimmed);
    setUsername(trimmed);
    // 再写云端（有 userId 时）
    if (userId) {
      setNameSaving(true);
      try {
        const { error } = await supabase.from('user_data').upsert({
          user_id: userId,
          user_name: trimmed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (error) console.warn('[Supabase] 更新用户名失败:', error.message);
      } finally {
        setNameSaving(false);
      }
    }
    return true;
  };

  return { username, saveUsername, nameSaving };
}

// ─── 头像上传 Hook ────────────────────────────────────────────────────────────

const AVATAR_KEY = 'lk_user_avatar';

function useAvatar() {
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(AVATAR_KEY) || null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    // 压缩为最大 200×200 的 base64
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 200;
        const canvas = document.createElement('canvas');
        const scale = Math.min(SIZE / img.width, SIZE / img.height, 1);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        localStorage.setItem(AVATAR_KEY, dataUrl);
        setAvatarUrl(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    // 清空 input，允许重复选同一文件
    e.target.value = '';
  };

  return { avatarUrl, handleFileChange };
}

// ─── 头像组件 ────────────────────────────────────────────────────────────────

function AvatarUploader({ avatarUrl, onFileChange }) {
  const ref = { current: null };
  return (
    <div
      className="profile-avatar profile-avatar-btn"
      onClick={() => ref.current?.click()}
      title="点击更换头像"
    >
      <img
        src={avatarUrl || `${import.meta.env.BASE_URL}default-avatar.png`}
        alt="头像"
        className="profile-avatar-img"
      />
      <span className="profile-avatar-edit">✎</span>
      <input
        ref={r => { ref.current = r; }}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}

export default function Profile({ navigate }) {
  const { state, syncStatus, authUser, userId } = useStore();
  const [tab, setTab] = useState('account'); // 'account' | 'guide' | 'history'
  const [showBindModal, setShowBindModal] = useState(false);
  // 'idle' | 'sent'  —— 仅记录「邮件是否刚发出」
  const [bindSentEmail, setBindSentEmail] = useState(null);
  const { avatarUrl, handleFileChange } = useAvatar();
  const { username, saveUsername, nameSaving } = useUsername();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaved, setNameSaved] = useState(false);  // 短暂显示「已保存」

  // 从 store 的 authUser 派生账号状态
  // authUser 为 null 时不显示任何技术状态，直接当匿名处理（初始 localStorage 数据随时可用）
  const isBound = !!authUser?.email;
  const userEmail = authUser?.email ?? null;

  // 统计（我的）
  const totalObtained = Object.values(state.spirits).filter(s => s.obtained).length;
  const totalSpirits = Object.keys(state.spirits).length;
  const completionPct = Math.round((totalObtained / totalSpirits) * 100);

  // 统计（历史）
  const tasks = state.completedTasks || [];
  const successTasks = tasks.filter(t => t.resultType !== 'abandoned');
  const totalShiny = successTasks.length;
  // 平均触发只统计通过正常刷取流程完成的记录（排除 manual 类型）
  const normalSuccessTasks = successTasks.filter(t => t.resultType !== 'manual' && t.shieldBreakCount != null);
  const totalBreaks = normalSuccessTasks.reduce((s, t) => s + (t.shieldBreakCount || 0), 0);
  const avgBreaks = normalSuccessTasks.length > 0 ? Math.round(totalBreaks / normalSuccessTasks.length) : 0;

  const syncColor = syncStatus === 'ready' ? '#4CAF50' : syncStatus === 'offline' ? '#FF9800' : '#9E9E9E';

  return (
    <div className="page profile-page">
      {/* 页头 */}
      <div className="page-header">
        <h2>我的</h2>
      </div>

      {/* 内部 Tab 切换 */}
      <div className="profile-tabs">
        <button
          className={`profile-tab-btn${tab === 'account' ? ' active' : ''}`}
          onClick={() => setTab('account')}
        >账号 & 攻略</button>
        <button
          className={`profile-tab-btn${tab === 'history' ? ' active' : ''}`}
          onClick={() => setTab('history')}
        >刷取记录</button>
      </div>

      {/* ══ Tab A：账号 & 数据 ══════════════════════════════════════════════════ */}
      {tab === 'account' && (
        <>
          {/* ── 账号卡片 ── */}
          <div className="profile-card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* 迪莫剪影装饰 */}
            <img
              src={`${import.meta.env.BASE_URL}dimo-bg.png`}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute', right: 28, top: '50%',
                transform: 'translateY(-50%)',
                width: 90, height: 90,
                objectFit: 'contain',
                opacity: 0.18,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            <AvatarUploader avatarUrl={avatarUrl} onFileChange={handleFileChange} />
            <div className="profile-info">
              {/* 昵称行 */}
              {editingName ? (
                <div className="username-edit-row">
                  <input
                    className="username-input"
                    value={nameInput}
                    maxLength={12}
                    autoFocus
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        saveUsername(nameInput, userId).then(ok => {
                          if (ok) { setEditingName(false); setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }
                        });
                      }
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                  />
                  <button
                    className="username-confirm-btn"
                    disabled={nameSaving}
                    onClick={() => {
                      saveUsername(nameInput, userId).then(ok => {
                        if (ok) { setEditingName(false); setNameSaved(true); setTimeout(() => setNameSaved(false), 2000); }
                      });
                    }}
                  >{nameSaving ? '…' : '✓'}</button>
                  <button className="username-cancel-btn"
                    onClick={() => setEditingName(false)}>✕</button>
                </div>
              ) : (
                <div className="username-display-row">
                  <span className="profile-username">{username}</span>
                  {nameSaved && (
                    <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, marginLeft: 4 }}>已同步✓</span>
                  )}
                  <button className="username-edit-icon"
                    onClick={() => { setNameInput(username); setEditingName(true); }}>✎</button>
                </div>
              )}
              {/* 邮箱状态行 */}
              {isBound
                ? <span className="profile-email-tag bound">✅ {userEmail}</span>
                : <span className="profile-email-tag anon">未绑定邮箱</span>
              }
            </div>
            {/* 云同步指示点 */}
            <span className="sync-dot-only" style={{ background: syncColor }} title={
              syncStatus === 'ready' ? '已同步' : syncStatus === 'offline' ? '离线' : '同步中'
            } />
          </div>

          {/* ── 邮箱绑定区 ── */}
          {!isBound && (
            <div className="bind-email-banner">
              <div className="bind-email-banner-left">
                <div className="bind-email-banner-title">保护你的数据安全</div>
                <div className="bind-email-banner-desc">
                  绑定邮箱后，换手机或重装也能一键恢复所有记录
                </div>
              </div>
              <button
                className="bind-email-banner-btn"
                onClick={() => setShowBindModal(true)}
              >绑定</button>
            </div>
          )}

          {/* ── 邮件已发出提示条 ── */}
          {bindSentEmail && !isBound && (
            <div className="bind-sent-bar">
              <span>📬 确认邮件已发至 <strong>{bindSentEmail}</strong>，点击邮件链接完成绑定</span>
              <button className="bind-sent-dismiss" onClick={() => setBindSentEmail(null)}>✕</button>
            </div>
          )}

          {/* ── 已绑定：邮箱管理行 ── */}
          {isBound && (
            <div className="profile-section">
              <div className="section-title">账号安全</div>
              <div className="profile-about">
                <div className="about-row">
                  <span>绑定邮箱</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>{userEmail}</span>
                </div>
                <div className="about-row" style={{ cursor: 'pointer' }}
                  onClick={() => setShowBindModal(true)}>
                  <span>换绑 / 找回账号</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>用新邮箱登录 →</span>
                </div>
              </div>
            </div>
          )}

          {/* 收集进度 */}
          <div className="profile-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="section-title" style={{
              background: '#2B2A2E',
              color: '#FBF7EC',
              padding: '10px 16px',
              margin: 0,
              borderRadius: 0,
              fontFamily: 'var(--font-display)',
              letterSpacing: 0.5,
            }}>
              收集进度
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(251,247,236,0.6)', marginLeft: 6 }}>
                ({totalObtained}/{totalSpirits})
              </span>
            </div>
            <div style={{ padding: '12px 16px 14px' }}>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#4CAF50' }}>{totalObtained}</span>
                <span className="stat-label">已获得</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value" style={{ color: '#C8830A' }}>{totalSpirits - totalObtained}</span>
                <span className="stat-label">待收集</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">{completionPct}%</span>
                <span className="stat-label">完成度</span>
              </div>
            </div>
            <div className="profile-progress-bar">
              <div
                className="profile-progress-fill"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            </div>{/* /padding wrapper */}
          </div>

          {/* 果实解锁攻略入口（与 profile-section 同层级） */}
          <button
            onClick={() => navigate('fruitGuide')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: 'calc(100% - 32px)', margin: '0 16px 12px',
              padding: '14px 16px',
              border: '1.5px solid var(--card-border)',
              borderRadius: 'var(--radius)',
              background: 'var(--card)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(200,131,10,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={`${import.meta.env.BASE_URL}fruit-icon.png`} alt="果实" width={36} height={36}
                style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#2B2A2E', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                果实解锁攻略
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                图鉴 & 地图互动果实的具体获取位置
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 16, flexShrink: 0 }}>›</span>
          </button>

          {/* 关于 */}
          <div className="profile-section">
            <div className="section-title">关于</div>
            <div className="profile-about">
              <div className="about-row"><span>版本</span><span>v2.0</span></div>
              <div className="about-row"><span>机制更新</span><span>已同步 4.23 版本</span></div>
              <div className="about-row"><span>数据存储</span><span>本地 + 云端双备份</span></div>
            </div>
          </div>
        </>
      )}

      {/* ══ Tab B：刷取记录 ═════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div style={{ paddingBottom: 24 }}>
          {/* 汇总统计卡 */}
          {tasks.length > 0 && (
            <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                  { label: '成功出货', value: totalShiny, unit: '次', color: '#4B9C46', bg: 'rgba(75,156,70,0.06)' },
                  { label: '平均触发污染', value: normalSuccessTasks.length > 0 ? avgBreaks : '—', unit: normalSuccessTasks.length > 0 ? '次' : '', color: '#C8830A', bg: 'rgba(200,131,10,0.06)' },
                  { label: '中断次数', value: tasks.filter(t => t.resultType === 'abandoned').length, unit: '次', color: '#A09080', bg: 'transparent' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: '14px 10px', textAlign: 'center',
                    borderRight: i < 2 ? '1px solid var(--divider)' : 'none',
                    background: stat.bg,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                      {stat.value}
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 1 }}>{stat.unit}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 「+ 补充我的异色」入口按钮 */}
          <button
            onClick={() => navigate('manualShiny')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: 'calc(100% - 32px)', margin: '10px 16px 2px',
              padding: '11px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: '#2B2A2E',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 200 200" fill="none"
              xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M46.8359 160.664C46.3477 160.664 45.8203 160.547 45.1758 160.313C43.3008 159.629 42.3047 157.539 42.9492 155.645C46.8945 143.965 58.8477 115.449 60.3711 112.402C89.3359 54.5117 120.039 28.2227 169.922 18.6328C171.445 18.3594 172.949 19.0039 173.75 20.293C174.551 21.582 174.492 23.2422 173.574 24.4727L149.883 55.957C148.574 57.6953 148.145 59.9219 148.711 62.0313L151.914 73.9649C153.008 77.9883 152.285 82.3047 149.961 85.7617C148.814 87.4797 147.309 88.9294 145.549 90.0115C143.789 91.0936 141.816 91.7826 139.766 92.0313L123.398 94.0625C120.488 94.4336 118.105 96.582 117.422 99.3945C118.535 105.449 115.605 111.582 110.195 114.199C107.441 115.547 104.375 115.957 101.367 115.41L86.7187 112.773C84.4922 112.383 82.1875 113.184 80.7031 114.863L55.9961 142.754C55.4492 144.082 52.9492 150.43 51.5625 153.945C51.0352 155.273 50.6055 156.406 50.1758 157.324C50.0977 157.559 50.0195 157.773 49.9414 157.988L49.8633 157.969C48.9844 159.766 48.1445 160.664 46.8359 160.664ZM161.68 28.0078C119.512 38.6133 93.1836 63.3203 66.9922 115.703C66.6016 116.484 65.4687 119.082 63.9453 122.676L75.1758 110C78.3594 106.406 83.2813 104.688 88.0078 105.547L102.656 108.184C104.141 108.457 105.625 108.242 106.973 107.598C109.512 106.367 110.82 103.32 110.078 100.352C109.961 99.8828 109.941 99.375 110 98.9063C110.977 92.5586 116.113 87.5781 122.48 86.7774L138.848 84.7461C140.879 84.4922 142.695 83.3789 143.828 81.6797C144.961 79.9805 145.312 77.8906 144.785 75.918L141.582 63.9844C140.41 59.668 141.289 55.1367 143.984 51.5625L161.68 28.0078ZM85.1367 183.789C78.7695 183.789 75.4492 179.805 73.0273 176.895C70.7031 174.121 69.375 172.656 66.6016 172.656C63.8281 172.656 62.4805 174.102 60.1563 176.895C57.7344 179.805 54.4141 183.789 48.0469 183.789C41.6797 183.789 38.3789 179.805 35.957 176.895C33.6328 174.102 32.3047 172.656 29.5117 172.656C27.4805 172.656 25.8203 170.996 25.8203 168.965C25.8203 166.934 27.4805 165.273 29.5117 165.273C35.8789 165.273 39.1992 169.258 41.6211 172.168C43.9453 174.941 45.2734 176.406 48.0469 176.406C50.8203 176.406 52.168 174.961 54.4922 172.168C56.9141 169.258 60.2344 165.273 66.6016 165.273C72.9688 165.273 76.2891 169.258 78.7109 172.168C81.0352 174.941 82.3633 176.406 85.1562 176.406C87.1875 176.406 88.8477 178.066 88.8477 180.098C88.8281 182.148 87.168 183.789 85.1367 183.789Z" fill="#FFFFFF"/>
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                + 补充我的异色
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                手动记录以前抓过的精灵 & 消耗
              </div>
            </div>
          </button>

          {/* 空状态 */}
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">
                暂无刷取记录<br />开始第一次刷取后，记录将显示在这里
              </div>
            </div>
          ) : (
            <>
              <div style={{ margin: '4px 16px 6px', fontSize: 11, color: 'var(--text-light)', fontWeight: 700, letterSpacing: 1 }}>
                ▼ 最近记录（共 {tasks.length} 条）
              </div>
              {tasks.map((task, i) => (
                <HistoryCard key={task.id || i} task={task} index={i} />
              ))}
            </>
          )}
        </div>
      )}

      {/* 邮箱绑定弹窗 */}
      {showBindModal && (
        <BindEmailModal
          onClose={() => setShowBindModal(false)}
          onSuccess={(email) => {
            // 邮件发出后关闭弹窗，顶部显示提示条
            // 真正的账号升级在用户点邮件链接后由 store 的 onAuthStateChange 自动完成
            setBindSentEmail(email);
            setShowBindModal(false);
          }}
        />
      )}

    </div>
  );
}
