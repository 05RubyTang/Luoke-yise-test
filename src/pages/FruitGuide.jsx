import { useState, useMemo } from 'react';
import FruitTag from '../components/FruitTag';
import { FRUIT_GUIDE_TABS, ATTR_CONFIG, getTabEntries, getAllEntries, getTabAttrs } from '../data/fruitGuide';
import { useStore } from '../store';

// ─── 属性徽章 ─────────────────────────────────────────────────────────────────
function AttrBadge({ attr }) {
  const cfg = ATTR_CONFIG[attr] || { color: '#A09080', bg: '#F0EAE0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 800,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 6, padding: '1px 6px',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {cfg.icon && <img src={cfg.icon} alt={attr} width={11} height={11} style={{ objectFit: 'contain' }} />}
      {attr}
    </span>
  );
}

// ─── 单个果实条目 ─────────────────────────────────────────────────────────────
function FruitEntry({ entry, isOwned, onToggle, groupColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 10px', borderRadius: 10,
      background: isOwned ? 'rgba(75,156,70,0.07)' : 'var(--card-inner)',
      border: isOwned ? '1px solid rgba(75,156,70,0.25)' : '1px solid transparent',
      transition: 'background 0.2s, border 0.2s',
    }}>
      <FruitTag name={entry.fruit} size={38} showName={false} style={{ flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 行1：果实名 + 属性 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#2B2A2E', fontFamily: 'var(--font-display)' }}>
            {entry.fruit}
          </span>
          {entry.attrs?.map(a => <AttrBadge key={a} attr={a} />)}
        </div>

        {/* 行2：解锁条件 */}
        {entry.unlock && (
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 10, fontWeight: 700,
            color: groupColor || '#C8830A',
            background: `${groupColor || '#C8830A'}15`,
            border: `1px solid ${groupColor || '#C8830A'}35`,
            borderRadius: 6, padding: '1px 6px',
            marginBottom: entry.location || entry.tip ? 3 : 0,
          }}>
            {entry.unlock}
          </div>
        )}

        {/* 行3：地点 + 备注 */}
        {(entry.location || entry.tip) && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {entry.location && <span>📍 {entry.location}</span>}
            {entry.tip && (
              <span style={{ color: '#C8830A', marginLeft: entry.location ? 4 : 0 }}>
                {entry.location ? '· ' : ''}{entry.tip}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 已拥有切换按钮 */}
      <button
        onClick={() => onToggle(entry.fruit)}
        style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 10,
          border: isOwned ? '1.5px solid rgba(75,156,70,0.5)' : '1.5px solid var(--divider)',
          background: isOwned ? 'rgba(75,156,70,0.12)' : 'var(--card)',
          color: isOwned ? '#4B9C46' : 'var(--text-muted)',
          fontSize: 15, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.18s',
        }}
      >
        {isOwned ? '✓' : '+'}
      </button>
    </div>
  );
}

// ─── 属性筛选浮层 ─────────────────────────────────────────────────────────────
function AttrFilterSheet({ attrs, selected, onChange, onClose }) {
  const [local, setLocal] = useState(selected);

  const toggle = (attr) => {
    setLocal(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', background: '#FBF7EC',
          borderRadius: '20px 20px 0 0',
          padding: '20px 16px 40px',
          maxHeight: '70vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题行 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#2B2A2E', fontFamily: 'var(--font-display)' }}>
            属性筛选
          </span>
          {local.length > 0 && (
            <button
              onClick={() => setLocal([])}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              }}
            >
              重置
            </button>
          )}
        </div>

        {/* 属性 chip 网格 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {attrs.map(attr => {
            const cfg = ATTR_CONFIG[attr] || { color: '#A09080', bg: '#F0EAE0' };
            const isSelected = local.includes(attr);
            return (
              <button
                key={attr}
                onClick={() => toggle(attr)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20,
                  border: isSelected ? `1.5px solid ${cfg.color}` : '1.5px solid var(--divider)',
                  background: isSelected ? `${cfg.bg}` : 'var(--card-inner)',
                  color: isSelected ? cfg.color : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {cfg.icon && <img src={cfg.icon} alt={attr} width={14} height={14} style={{ objectFit: 'contain' }} />}
                {attr}
              </button>
            );
          })}
        </div>

        {/* 确定按钮 */}
        <button
          onClick={() => { onChange(local); onClose(); }}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 14,
            border: 'none', background: '#2B2A2E',
            color: '#FBF7EC', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          确定{local.length > 0 ? `（已选 ${local.length} 个属性）` : ''}
        </button>
      </div>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────
export default function FruitGuide({ goBack }) {
  const { state, dispatch } = useStore();
  const ownedFruits = state.ownedFruits || [];

  const [activeTabId, setActiveTabId] = useState('catch');
  const [showAttrFilter, setShowAttrFilter] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState([]);

  // 当前 Tab 数据
  const currentTab = FRUIT_GUIDE_TABS.find(t => t.id === activeTabId);

  // 当前 Tab 下所有 entries（扁平）
  const currentEntries = useMemo(() => getTabEntries(currentTab), [currentTab]);

  // 当前 Tab 下所有可筛选属性
  const currentAttrs = useMemo(() => getTabAttrs(currentTab), [currentTab]);

  // 筛选后的果实名 Set（null = 不筛选）
  const filteredFruits = useMemo(() => {
    if (selectedAttrs.length === 0) return null;
    return new Set(
      currentEntries
        .filter(e => e.attrs?.some(a => selectedAttrs.includes(a)))
        .map(e => e.fruit)
    );
  }, [currentEntries, selectedAttrs]);

  // 是否显示某条 entry
  const isVisible = (fruit) => !filteredFruits || filteredFruits.has(fruit);

  // 全局已拥有计数（跨 Tab）
  const allEntries = useMemo(() => getAllEntries(), []);
  const totalOwned = allEntries.filter(e => ownedFruits.includes(e.fruit)).length;
  const totalFruits = allEntries.length;

  // 每个 Tab 的总数
  const tabCounts = useMemo(() =>
    FRUIT_GUIDE_TABS.reduce((acc, tab) => {
      acc[tab.id] = getTabEntries(tab).length;
      return acc;
    }, {}),
    []
  );

  const toggle = (fruitName) => dispatch({ type: 'TOGGLE_OWNED_FRUIT', fruit: fruitName });

  // 当前 Tab 所有果实名（扁平）
  const tabFruits = useMemo(() => currentEntries.map(e => e.fruit), [currentEntries]);
  const tabFruitSet = useMemo(() => new Set(tabFruits), [tabFruits]);

  // 当前 Tab 全选
  const handleSelectAll = () => {
    const merged = [...new Set([...ownedFruits, ...tabFruits])];
    dispatch({ type: 'SET_OWNED_FRUITS', fruits: merged });
  };

  // 当前 Tab 全取消
  const handleClearTab = () => {
    const remaining = ownedFruits.filter(f => !tabFruitSet.has(f));
    dispatch({ type: 'SET_OWNED_FRUITS', fruits: remaining });
  };

  // 切换 Tab 时清空属性筛选
  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    setSelectedAttrs([]);
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>
          <img src={`${import.meta.env.BASE_URL}back-icon.png`} alt="返回" />
        </button>
        <span className="page-header-title">果实解锁攻略</span>
      </div>

      {/* 全局进度条幅 */}
      <div className="card animate-in" style={{
        background: 'linear-gradient(135deg, #FFF4D6 0%, #FFF9EC 100%)',
        border: '1px solid rgba(200,131,10,0.25)',
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#C8830A' }}>
            🌿 果实获取进度
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: totalOwned === totalFruits ? '#4CAF50' : '#C8830A',
          }}>
            {totalOwned} / {totalFruits} 已获得
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          点右侧 + 标记已拥有，数据随账号云端保存。
        </div>
      </div>

      {/* Tab 切换栏 */}
      <div style={{
        display: 'flex', gap: 0,
        margin: '0 16px 12px',
        background: 'var(--card-inner)',
        borderRadius: 14, padding: 4,
        overflow: 'hidden',
      }}>
        {FRUIT_GUIDE_TABS.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px 4px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                background: isActive ? '#FBF7EC' : 'transparent',
                boxShadow: isActive ? '0 1px 4px rgba(43,42,46,0.10)' : 'none',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{
                fontSize: 12, fontWeight: 900,
                color: isActive ? '#2B2A2E' : 'var(--text-muted)',
                fontFamily: 'var(--font-display)',
              }}>
                {tab.label}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: isActive ? '#C8830A' : 'var(--text-muted)',
                marginTop: 1,
              }}>
                {tabCounts[tab.id]} 种
              </span>
            </button>
          );
        })}
      </div>

      {/* 筛选行：属性筛选 + Tab 全选/全取消 */}
      <div style={{ margin: '0 16px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* 属性筛选 */}
        <button
          onClick={() => setShowAttrFilter(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20,
            border: selectedAttrs.length > 0
              ? '1.5px solid #C8830A'
              : '1.5px solid var(--divider)',
            background: selectedAttrs.length > 0
              ? 'rgba(200,131,10,0.10)'
              : 'var(--card-inner)',
            color: selectedAttrs.length > 0 ? '#C8830A' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          <span style={{ fontSize: 13 }}>⚙️</span>
          属性筛选
          {selectedAttrs.length > 0 && (
            <span style={{
              background: '#C8830A', color: '#fff',
              borderRadius: 10, fontSize: 10, fontWeight: 900,
              padding: '0 5px', lineHeight: '16px', minWidth: 16,
              textAlign: 'center',
            }}>
              {selectedAttrs.length}
            </span>
          )}
        </button>
        {selectedAttrs.length > 0 && (
          <button
            onClick={() => setSelectedAttrs([])}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              padding: 0,
            }}
          >
            清除
          </button>
        )}

        {/* 弹性空白 */}
        <div style={{ flex: 1 }} />

        {/* Tab 级 全选 / 全取消 */}
        <button
          onClick={handleSelectAll}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '5px 10px', borderRadius: 16,
            border: '1.5px solid rgba(75,156,70,0.4)',
            background: 'rgba(75,156,70,0.07)',
            color: '#4B9C46', fontSize: 11, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >✓ 全有</button>
        <button
          onClick={handleClearTab}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '5px 10px', borderRadius: 16,
            border: '1.5px solid var(--divider)',
            background: 'var(--card-inner)',
            color: 'var(--text-muted)', fontSize: 11, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >× 全无</button>
      </div>

      {/* Tab 内容区 */}
      <div className="card animate-in" key={activeTabId}>
        {/* Tab 描述 */}
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid var(--divider)',
        }}>
          {currentTab.desc}
        </div>

        {/* 扁平列表（抓取获得 Tab） */}
        {currentTab.entries && (() => {
          const visible = currentTab.entries.filter(e => isVisible(e.fruit));
          if (visible.length === 0) {
            return (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
                没有匹配的果实
              </div>
            );
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visible.map((entry, i) => (
                <FruitEntry
                  key={i}
                  entry={entry}
                  isOwned={ownedFruits.includes(entry.fruit)}
                  onToggle={toggle}
                  groupColor="#C8830A"
                />
              ))}
            </div>
          );
        })()}

        {/* 分组列表（图鉴奖励 / 赛季&活动 Tab） */}
        {currentTab.groups && currentTab.groups.map((group, gi) => {
          const visible = group.entries.filter(e => isVisible(e.fruit));
          if (visible.length === 0) return null;
          return (
            <div key={group.id} style={{ marginBottom: gi < currentTab.groups.length - 1 ? 18 : 0 }}>
              {/* 子分组标题 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 3, height: 14, borderRadius: 2,
                  background: group.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, fontWeight: 900, color: '#2B2A2E', fontFamily: 'var(--font-display)' }}>
                  {group.label}
                </span>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 700,
                  background: `${group.color}18`, color: group.color,
                  border: `1px solid ${group.color}40`,
                }}>
                  {visible.length} 个
                </span>
                {group.desc && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {group.desc}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visible.map((entry, i) => (
                  <FruitEntry
                    key={i}
                    entry={entry}
                    isOwned={ownedFruits.includes(entry.fruit)}
                    onToggle={toggle}
                    groupColor={group.color}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* 全部被筛选掉时 */}
        {currentTab.groups && currentTab.groups.every(g => g.entries.every(e => !isVisible(e.fruit))) && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
            没有匹配的果实
          </div>
        )}
      </div>

      {/* 属性筛选浮层 */}
      {showAttrFilter && (
        <AttrFilterSheet
          attrs={currentAttrs}
          selected={selectedAttrs}
          onChange={setSelectedAttrs}
          onClose={() => setShowAttrFilter(false)}
        />
      )}
    </div>
  );
}
