import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SpiritAvatar from './SpiritAvatar';
import { getAllEntries } from '../data/fruitGuide';
import { classifyResultType, POOL_TYPE_CONFIG, resolveToTargetSpirit } from '../data/plans';

const getModalRoot = () => document.getElementById('modal-root') || document.body;

// 精灵名候选列表（去重，按名称排序）
const ALL_SPIRIT_NAMES = [];
const _seenSpirits = new Set();
getAllEntries().forEach(e => {
  if (e.spirit && !_seenSpirits.has(e.spirit)) {
    _seenSpirits.add(e.spirit);
    ALL_SPIRIT_NAMES.push(e.spirit);
  }
});
ALL_SPIRIT_NAMES.sort((a, b) => a.localeCompare(b, 'zh'));

/** 根据推导结果返回提示标签的样式配置 */
function getPoolHint(resultType) {
  if (!resultType) return null;
  const cfg = POOL_TYPE_CONFIG[resultType];
  if (!cfg) return null;
  const icon = resultType === 'family' ? '✓' : resultType === 'attr' ? '⚡' : '🎲';
  return { icon, label: cfg.label, tagBg: cfg.tagBg, tagColor: cfg.tagColor, tagBorder: cfg.tagBorder };
}

export default function ShinySelectModal({ plan, onSelect, onClose, hasTabBar = true }) {
  const hasPoolSpirits = Array.isArray(plan.shinies) && plan.shinies.length > 0;
  const [showInput, setShowInput] = useState(!hasPoolSpirits);
  const [customName, setCustomName] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  // 家族映射提示：{ original, resolved } | null
  const [familyHint, setFamilyHint] = useState(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // 实时推导池类型（输入不为空时才推导）
  const trimmed = customName.trim();
  const inferredType = trimmed ? classifyResultType(trimmed, plan) : null;
  const poolHint = getPoolHint(inferredType);

  // 根据输入关键词过滤精灵候选（最多 8 条）
  const suggestions = useMemo(() => {
    const q = customName.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    const matched = ALL_SPIRIT_NAMES.filter(n => n.includes(q) || n.toLowerCase().includes(lower));
    matched.sort((a, b) => {
      const aStart = a.startsWith(q) ? 0 : 1;
      const bStart = b.startsWith(q) ? 0 : 1;
      return aStart - bStart || a.localeCompare(b, 'zh');
    });
    return matched.slice(0, 8);
  }, [customName]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 统一的「确认精灵」函数，自动做家族映射
  const confirmSpirit = (rawName) => {
    const { resolved, original, mapped } = resolveToTargetSpirit(rawName);
    if (mapped) {
      setFamilyHint({ original, resolved });
      setTimeout(() => {
        setFamilyHint(null);
        onSelect(resolved);
      }, 900);
    } else {
      onSelect(resolved);
    }
    setDropOpen(false);
  };

  const handleKeyDown = (e) => {
    if (dropOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); return; }
      if (e.key === 'Enter')     { e.preventDefault(); confirmSpirit(suggestions[highlighted]); return; }
      if (e.key === 'Escape')    { setDropOpen(false); return; }
    }
    if (e.key === 'Enter' && (!dropOpen || suggestions.length === 0) && trimmed) {
      confirmSpirit(trimmed);
    }
  };

  return createPortal(
    <div className={`modal-overlay${hasTabBar ? '' : ' modal-overlay--no-tab'}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* 家族映射提示 Toast */}
        {familyHint && (
          <div style={{
            margin: '0 0 12px',
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(200,131,10,0.1)',
            border: '1.5px solid rgba(200,131,10,0.35)',
            fontSize: 12, lineHeight: 1.6, color: '#9A6A00',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔄</span>
            <span>
              <span style={{ fontWeight: 700 }}>「{familyHint.original}」</span>
              {' '}是同家族精灵，已自动匹配为{' '}
              <span style={{ fontWeight: 800, color: '#C8830A' }}>「{familyHint.resolved}」</span>
            </span>
          </div>
        )}

        <div className="modal-title" style={{ color: '#C8830A' }}>
          ✨ 出了哪只异色？
        </div>

        {/* 方案内精灵（自定义方案无 shinies 时不渲染） */}
        {hasPoolSpirits && (
          <>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              marginBottom: 10, letterSpacing: 0.5, fontWeight: 700,
            }}>
              方案内精灵
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              marginBottom: 14,
            }}>
              {plan.shinies.map(name => (
                <button
                  key={name}
                  onClick={() => confirmSpirit(name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    border: '1.5px solid rgba(103,93,83,0.2)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--card-inner)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    color: 'var(--text)', fontWeight: 700, fontSize: 13,
                    fontFamily: 'var(--font-body)', textAlign: 'left',
                    boxShadow: '0 2px 0 rgba(103,93,83,0.15)',
                  }}
                >
                  <SpiritAvatar name={name} size={36} showName={false} />
                  <span style={{ flex: 1 }}>{name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 方案外精灵 / 自定义方案直接输入 */}
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          marginBottom: 10, letterSpacing: 0.5, fontWeight: 700,
        }}>
          {hasPoolSpirits ? '其他精灵（属性池 / 世界池意外收获）' : '输入获得的精灵名'}
        </div>

        {!showInput ? (
          <button className="modal-option" onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
            <span className="modal-option-icon">🎲</span>
            <span style={{ fontWeight: 700 }}>其他精灵（手动输入）</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 输入框 + 自动补全下拉 */}
            <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={wrapRef}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={customName}
                  onChange={e => { setCustomName(e.target.value); setDropOpen(true); setHighlighted(0); }}
                  onFocus={() => { if (customName.trim()) setDropOpen(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="输入精灵名称（如：呼呼猪…）"
                  autoFocus
                  className="input-field"
                  style={{ width: '100%' }}
                  autoComplete="off"
                />
                {/* 自动补全下拉 */}
                {dropOpen && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#FBF7EC', border: '1.5px solid var(--card-border)',
                    borderRadius: 10, boxShadow: '0 4px 16px rgba(43,42,46,0.14)',
                    zIndex: 600, overflow: 'hidden',
                  }}>
                    {suggestions.map((name, i) => (
                      <div
                        key={name}
                        onMouseDown={() => confirmSpirit(name)}
                        onMouseEnter={() => setHighlighted(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', cursor: 'pointer',
                          background: i === highlighted ? 'rgba(200,131,10,0.08)' : 'transparent',
                          borderBottom: i < suggestions.length - 1 ? '1px solid var(--divider)' : 'none',
                          transition: 'background 0.1s',
                        }}
                      >
                        <SpiritAvatar name={name} size={28} showName={false} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                disabled={!trimmed}
                onClick={() => trimmed && confirmSpirit(trimmed)}
                style={{
                  flexShrink: 0, alignSelf: 'flex-start',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid #2B2A2E',
                  background: trimmed ? '#2B2A2E' : '#B0A898',
                  color: '#FBF7EC',
                  fontWeight: 800, fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  cursor: trimmed ? 'pointer' : 'not-allowed',
                  boxShadow: trimmed ? '0 2px 0 #111014' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                确认
              </button>
            </div>

            {/* 实时池类型推导提示 */}
            {poolHint && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 8,
                background: poolHint.tagBg,
                border: `1px solid ${poolHint.tagBorder}`,
              }}>
                <span style={{ fontSize: 13 }}>{poolHint.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: poolHint.tagColor,
                  }}>
                    预计：{poolHint.label}
                  </span>
                  {inferredType === 'attr' && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 5 }}>
                      精灵属性与当前果实属系匹配
                    </span>
                  )}
                  {inferredType === 'world' && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 5 }}>
                      属性不匹配或无法识别
                    </span>
                  )}
                  {inferredType === 'family' && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 5 }}>
                      该精灵在本方案家族内
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.7 }}>可覆盖</span>
              </div>
            )}
          </div>
        )}

        <button className="modal-close" onClick={onClose}>取消</button>
      </div>
    </div>,
    getModalRoot()
  );
}
