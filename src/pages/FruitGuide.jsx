import FruitTag from '../components/FruitTag';
import { FRUIT_GUIDE_GROUPS, ATTR_CONFIG } from '../data/fruitGuide';
import { useStore } from '../store';

// 单个属性徽章
function AttrBadge({ attr }) {
  const cfg = ATTR_CONFIG[attr] || { color: '#A09080', bg: '#F0EAE0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 800,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 6, padding: '1px 6px',
      whiteSpace: 'nowrap',
    }}>
      {cfg.icon && (
        <img src={cfg.icon} alt={attr} width={11} height={11}
          style={{ objectFit: 'contain', verticalAlign: 'middle' }} />
      )}
      {attr}
    </span>
  );
}

// 属性徽章组（支持双属性数组）
function AttrBadges({ attrs, note }) {
  if (!attrs || attrs.length === 0) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      {attrs.map((a) => <AttrBadge key={a} attr={a} />)}
      {note && (
        <span style={{ fontSize: 10, fontWeight: 500, color: '#A09080', whiteSpace: 'nowrap' }}>
          · {note}
        </span>
      )}
    </span>
  );
}

export default function FruitGuide({ goBack }) {
  const { state, dispatch } = useStore();
  const ownedFruits = state.ownedFruits || [];

  const allFruits = FRUIT_GUIDE_GROUPS.flatMap(g => g.entries.map(e => e.fruit));
  const totalFruits = allFruits.length;
  const totalOwned = allFruits.filter(f => ownedFruits.includes(f)).length;

  const toggle = (fruitName) => {
    dispatch({ type: 'TOGGLE_OWNED_FRUIT', fruit: fruitName });
  };
  const setAll = () => dispatch({ type: 'SET_OWNED_FRUITS', fruits: allFruits });
  const clearAll = () => dispatch({ type: 'SET_OWNED_FRUITS', fruits: [] });

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="page-header-title">果实解锁攻略</span>
      </div>

      {/* 说明横幅 */}
      <div className="card animate-in" style={{
        background: 'linear-gradient(135deg, #FFF4D6 0%, #FFF9EC 100%)',
        border: '1px solid rgba(200,131,10,0.25)',
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#C8830A' }}>
            🌿 智慧树苗果实获取方法
          </div>
          {/* 收集进度小计 */}
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: totalOwned === totalFruits ? '#4CAF50' : '#C8830A',
          }}>
            {totalOwned} / {totalFruits} 已拥有
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 10 }}>
          通过收录精灵图鉴或与地图互动解锁，获取后放入庇护所即可用于异色刷取。<br/>
          点击右侧 ✓ 标记已拥有，建方案时可直接选用。
        </div>
        {/* 快捷批量按钮 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={setAll}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 800,
              border: '1.5px solid rgba(75,156,70,0.4)',
              background: totalOwned === totalFruits ? 'rgba(75,156,70,0.12)' : 'rgba(75,156,70,0.07)',
              color: '#4B9C46',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            ✓ 我全都有
          </button>
          <button
            onClick={clearAll}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 800,
              border: '1.5px solid var(--divider)',
              background: 'var(--card-inner)',
              color: totalOwned === 0 ? 'var(--text-muted)' : 'var(--text-light)',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            × 我全没有
          </button>
        </div>
      </div>

      {/* 分组列表 */}
      {FRUIT_GUIDE_GROUPS.map((group, gi) => (
        <div key={group.id} className="card animate-in" style={{ animationDelay: `${gi * 0.06}s` }}>
          {/* 分组标题 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 4, height: 16, borderRadius: 2,
              background: group.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: '#2B2A2E', fontFamily: 'var(--font-display)' }}>
              {group.label}
            </span>
            <span style={{
              fontSize: 10, padding: '1px 7px', borderRadius: 10, fontWeight: 700,
              background: `${group.color}18`, color: group.color,
              border: `1px solid ${group.color}40`,
            }}>{group.entries.length} 个</span>
          </div>

          {/* 条目列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.entries.map((entry, i) => {
              const isOwned = ownedFruits.includes(entry.fruit);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10,
                  background: isOwned ? 'rgba(75,156,70,0.07)' : 'var(--card-inner)',
                  border: isOwned ? '1px solid rgba(75,156,70,0.25)' : '1px solid transparent',
                  transition: 'background 0.2s, border 0.2s',
                }}>
                  {/* 果实图标 */}
                  <FruitTag name={entry.fruit} size={38} showName={false} style={{ flexShrink: 0 }} />

                  {/* 右侧文字 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 第一行：果实名 + 属性徽章 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: '#2B2A2E',
                        fontFamily: 'var(--font-display)',
                        textDecoration: isOwned ? 'none' : 'none',
                      }}>
                        {entry.fruit}
                      </span>
                      {entry.attrs?.length > 0 && (
                        <AttrBadges attrs={entry.attrs} note={entry.attrNote} />
                      )}
                    </div>

                    {/* 第二行：解锁条件 */}
                    {entry.unlock && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        fontSize: 10, fontWeight: 700,
                        color: group.color,
                        background: `${group.color}15`,
                        border: `1px solid ${group.color}35`,
                        borderRadius: 6, padding: '1px 6px',
                        marginBottom: 3,
                      }}>
                        {entry.unlock}
                      </div>
                    )}

                    {/* 第三行：位置 + 备注 */}
                    {entry.location && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        📍 {entry.location}
                        {entry.tip && (
                          <span style={{ color: '#C8830A', marginLeft: 4 }}>· {entry.tip}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 已拥有切换按钮 */}
                  <button
                    onClick={() => toggle(entry.fruit)}
                    style={{
                      flexShrink: 0,
                      width: 32, height: 32, borderRadius: 10,
                      border: isOwned ? '1.5px solid rgba(75,156,70,0.5)' : '1.5px solid var(--divider)',
                      background: isOwned ? 'rgba(75,156,70,0.12)' : 'var(--card)',
                      color: isOwned ? '#4B9C46' : 'var(--text-muted)',
                      fontSize: 15, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                    title={isOwned ? '取消拥有' : '标记为已拥有'}
                  >
                    {isOwned ? '✓' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
