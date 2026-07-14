import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SpiritAvatar from './SpiritAvatar';
import { getAllEntries } from '../data/fruitGuide';
import { getPlanFruitsArray, resolveToTargetSpirit, ALL_SHINIES, fuzzyResolveSpiritName, SPIRIT_FAMILY_MAP } from '../data/plans';

const getModalRoot = () => document.getElementById('modal-root') || document.body;
const base = import.meta.env.BASE_URL;

// fruit → spirit 映射（用果实名反查正确精灵名，防止 plan.spiritX 被用户填错）
const FRUIT_SPIRIT_MAP = {};
// 精灵名候选列表（三层合并，去重，按名称排序）：
//   1. ALL_SHINIES：所有方案 shinies 并集（含幽影树等无果实的异色精灵）
//   2. fruitGuide 精灵：有果实的精灵
// 两者合并确保覆盖所有可能出现的奇遇精灵
const ALL_SPIRIT_NAMES = (() => {
  const seen = new Set();
  const result = [];
  const addName = n => { if (n && !seen.has(n)) { seen.add(n); result.push(n); } };
  // 优先加入 ALL_SHINIES（异色出货最相关）
  ALL_SHINIES.forEach(addName);
  // 再补入 fruitGuide 精灵（构建 FRUIT_SPIRIT_MAP 同时扩充候选）
  getAllEntries().forEach(e => {
    FRUIT_SPIRIT_MAP[e.fruit] = e.spirit;
    if (e.spirit) addName(e.spirit);
  });
  result.sort((a, b) => a.localeCompare(b, 'zh'));
  return result;
})();

// 家族链别名候选列表：SPIRIT_FAMILY_MAP 中所有进化前形态（key）
// 结构：{ alias: string, target: string }[]
const FAMILY_ALIAS_LIST = Object.entries(SPIRIT_FAMILY_MAP).map(([alias, target]) => ({ alias, target }));

// 快捷精灵卡片（复用 ShinySelectModal 相同样式）
function SpiritCard({ name, label, onClick }) {
  return (
    <button
      onClick={onClick}
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
        width: '100%',
      }}
    >
      <SpiritAvatar name={name} size={36} showName={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800 }}>{label || name}</div>
      </div>
    </button>
  );
}

/**
 * 选择这次奇遇的是哪只精灵。
 *
 * Props:
 *   plan        - 当前方案
 *   result      - 'original' | 'polluted' | 'shiny_blood' | 'mixed_blood'（用于显示上下文）
 *   onSelect(spiritName) - 确认选择回调
 *   onClose     - 关闭回调
 *   hasTabBar   - 是否有底部 TabBar（影响 overlay 高度）
 */
export default function BreakSpiritModal({ plan, result, onSelect, onClose, hasTabBar = true }) {
  const [showInput, setShowInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  // 家族映射提示：{ original, resolved } | null
  const [familyHint, setFamilyHint] = useState(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // suggestions 结构：{ name: string, familyTarget?: string }
  // 根据输入关键词过滤精灵候选（最多 8 条），同时补入家族链别名
  const suggestions = useMemo(() => {
    const q = customName.trim();
    if (!q) return [];
    const lower = q.toLowerCase();

    // 普通精灵候选（直接命中精灵名）
    const directMatched = ALL_SPIRIT_NAMES
      .filter(n => n.includes(q) || n.toLowerCase().includes(lower))
      .map(n => ({ name: n, familyTarget: undefined }));

    // 家族链别名候选（进化前形态 / 同家族名）
    const aliasMatched = FAMILY_ALIAS_LIST
      .filter(({ alias }) =>
        (alias.includes(q) || alias.toLowerCase().includes(lower)) &&
        !ALL_SPIRIT_NAMES.includes(alias)  // alias 不在精灵库里才独立展示
      )
      .map(({ alias, target }) => ({ name: alias, familyTarget: target }));

    const all = [...directMatched, ...aliasMatched];
    all.sort((a, b) => {
      // 直接命中优先于家族别名
      const aDirect = a.familyTarget ? 1 : 0;
      const bDirect = b.familyTarget ? 1 : 0;
      if (aDirect !== bDirect) return aDirect - bDirect;
      const aStart = a.name.startsWith(q) ? 0 : 1;
      const bStart = b.name.startsWith(q) ? 0 : 1;
      return aStart - bStart || a.name.localeCompare(b.name, 'zh');
    });

    // 去重
    const seen = new Set();
    return all.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    }).slice(0, 8);
  }, [customName]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // 统一的「确认精灵」函数：先拼写纠偏，再做家族映射
  const confirmSpirit = (rawName) => {
    // 1. 拼写纠偏（处理错字，精确命中时原样返回）
    const { resolved: spelled } = fuzzyResolveSpiritName(rawName);
    // 2. 家族映射（进化链别名归一化）
    const { resolved, original, mapped } = resolveToTargetSpirit(spelled);
    if (mapped) {
      // 显示映射提示 500ms 后再回调，让用户能看到
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
      if (e.key === 'Enter')     { e.preventDefault(); confirmSpirit(suggestions[highlighted].name); return; }
      if (e.key === 'Escape')    { setDropOpen(false); return; }
    }
    if (e.key === 'Enter' && (!dropOpen || suggestions.length === 0) && customName.trim()) {
      confirmSpirit(customName.trim());
    }
  };

  // 方案主精灵快捷按钮（支持 3+ 个：优先读 plan.fruits[]，兼容 fruitA/fruitB）
  // 优先用果实名反查正确精灵名（防止用户在 PlanEditor 里填错了 spiritX）
  const mainSpirits = useMemo(() => {
    const fruitsArr = getPlanFruitsArray(plan);
    const seen = new Set();
    return fruitsArr
      .map(f => {
        const name = (f.fruit && FRUIT_SPIRIT_MAP[f.fruit]) || f.spirit || null;
        return name ? { name } : null;
      })
      .filter(Boolean)
      .filter(s => { if (seen.has(s.name)) return false; seen.add(s.name); return true; });
  }, [plan]);

  const RESULT_META = {
    original:    { label: '原色精灵', color: 'var(--success)', icon: 'icon-original.webp' },
    polluted:    { label: '污染血脉', color: 'var(--polluted)', icon: 'icon-polluted.webp' },
    shiny_blood: { label: '奇异血脉', color: '#0BAF8A',        icon: 'icon-shiny-blood.webp' },
    mixed_blood: { label: '混血血脉', color: '#5B6DF6',        icon: 'icon-mixed-blood.webp' },
  };
  const { label: resultLabel, color: resultColor, icon: resultIcon } = RESULT_META[result] || RESULT_META.polluted;

  return createPortal(
    <div
      className={`modal-overlay${hasTabBar ? '' : ' modal-overlay--no-tab'}`}
      onClick={onClose}
    >
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

        {/* 标题 */}
        <div style={{ marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 4 }}>
            {result === 'original'
              ? '出现了哪只原色精灵？'
              : result === 'shiny_blood'
                ? '出现了哪只奇异血脉精灵？'
                : result === 'mixed_blood'
                  ? '出现了哪只混血血脉精灵？'
                  : '出现了哪只污染血脉精灵？'}
          </div>
          <div style={{
            fontSize: 11, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <img src={`${base}${resultIcon}`} alt={resultLabel} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ color: resultColor, fontWeight: 800 }}>{resultLabel}</span>
          </div>
        </div>

        {/* 方案主精灵快捷按钮 */}
        {mainSpirits.length > 0 && (
          <>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              marginBottom: 8, letterSpacing: 0.5, fontWeight: 700,
            }}>
              方案主精灵
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {mainSpirits.map(s => (
                <SpiritCard
                  key={s.name}
                  name={s.name}
                  onClick={() => confirmSpirit(s.name)}
                />
              ))}
            </div>
          </>
        )}

        {/* 其他精灵 / 手动输入 */}
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          marginBottom: 8, letterSpacing: 0.5, fontWeight: 700,
        }}>
          其他精灵
        </div>

        {!showInput ? (
          <button className="modal-option" onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
            <span className="modal-option-icon">🎲</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>其他精灵（手动输入）</div>
            </div>
          </button>
        ) : (
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
                  position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#FBF7EC', border: '1.5px solid var(--card-border)',
                  borderRadius: 10, boxShadow: '0 4px 16px rgba(43,42,46,0.14)',
                  zIndex: 600, overflow: 'hidden',
                }}>
                  {suggestions.map(({ name, familyTarget }, i) => (
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
                      {/* 家族别名：展示目标精灵头像；直接精灵：展示自身头像 */}
                      <SpiritAvatar name={familyTarget || name} size={28} showName={false} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                          {name}
                        </span>
                        {familyTarget && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            marginLeft: 6,
                            fontSize: 10, fontWeight: 700,
                            color: '#C8830A',
                            background: 'rgba(200,131,10,0.1)',
                            border: '1px solid rgba(200,131,10,0.3)',
                            borderRadius: 4, padding: '1px 5px',
                            whiteSpace: 'nowrap',
                          }}>
                            → {familyTarget}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              disabled={!customName.trim()}
              onClick={() => customName.trim() && confirmSpirit(customName.trim())}
              style={{
                flexShrink: 0, alignSelf: 'flex-start',
                padding: '11px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid #2B2A2E',
                background: customName.trim() ? '#2B2A2E' : '#B0A898',
                color: '#FBF7EC',
                fontWeight: 800, fontSize: 13,
                fontFamily: 'var(--font-body)',
                cursor: customName.trim() ? 'pointer' : 'not-allowed',
                boxShadow: customName.trim() ? '0 2px 0 #111014' : 'none',
                transition: 'all 0.15s',
              }}
            >
              确认
            </button>
          </div>
        )}

        <button className="modal-close" onClick={onClose}>取消</button>
      </div>
    </div>,
    getModalRoot()
  );
}
