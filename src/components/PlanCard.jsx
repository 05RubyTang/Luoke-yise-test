import SpiritAvatar from './SpiritAvatar';
import PlanIcon from './PlanIcon';
import { FruitLine } from './FruitTag';

// 计算某方案的平均出货（破盾次数均值），只统计非 abandoned 的成功记录
function calcAvgBreaks(planId, completedTasks) {
  if (!completedTasks?.length) return null;
  const relevant = completedTasks.filter(
    t => t.planId === planId && t.resultType !== 'abandoned' && t.shieldBreakCount != null
  );
  if (relevant.length === 0) return null;
  const avg = relevant.reduce((s, t) => s + t.shieldBreakCount, 0) / relevant.length;
  return { avg: Math.round(avg), count: relevant.length };
}

export default function PlanCard({ plan, spirits, isActive, onClick, compact = false, completedTasks }) {
  const obtainedCount = plan.shinies.filter(s => spirits[s]?.obtained).length;
  const allObtained = obtainedCount === plan.shinies.length;
  const avgInfo = calcAvgBreaks(plan.id, completedTasks);

  // 表头背景色：刷取中→金棕，全收集→深绿，默认→深黑
  const headerBg = isActive ? '#C8830A' : allObtained ? '#4B9C46' : '#2B2A2E';

  return (
    <div
      className="plan-card"
      onClick={onClick}
      style={{
        borderColor: isActive ? '#C8830A' : allObtained ? '#4B9C46' : '#675D53',
        boxShadow: isActive ? '0 2px 0 #C8830A' : allObtained ? '0 2px 0 #4B9C46' : '0 2px 0 #675D53',
        padding: 0,
        overflow: 'hidden',
        background: '#FBF7EC',
        ...(compact ? { margin: '0 0 8px' } : {}),
      }}
    >
      {/* ── 表头 ── */}
      <div style={{
        background: headerBg,
        padding: compact ? '8px 10px' : '10px 14px',
        display: 'flex', alignItems: 'center', gap: compact ? 6 : 10,
      }}>
        <PlanIcon plan={plan} size={compact ? 20 : 28} style={{ flexShrink: 0 }} />

        <span style={{
          flex: 1,
          fontSize: compact ? 13 : 15, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#FBF7EC', letterSpacing: 0.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{plan.type}</span>

        {isActive && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20,
            background: 'rgba(251,247,236,0.25)', color: '#FBF7EC',
            border: '1px solid rgba(251,247,236,0.4)', flexShrink: 0,
          }}>刷取中</span>
        )}

        {/* 收集计数 */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: compact ? 13 : 16, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {obtainedCount}
            <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(251,247,236,0.7)', marginLeft: 1 }}>
              /{plan.shinies.length}
            </span>
          </div>
          {allObtained && (
            <div style={{ fontSize: 9, color: '#FBF7EC', fontWeight: 700, marginTop: 2 }}>✓ 全收集</div>
          )}
        </div>
      </div>

      {/* ── 卡片内容区 ── */}
      <div style={{ padding: compact ? '8px 10px' : '12px 14px 10px' }}>
        {/* 果实名 */}
        <div style={{
          fontSize: 10, color: 'var(--text-muted)', marginBottom: compact ? 6 : 8,
        }}>
          <FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={compact ? 13 : 14} />
        </div>

        {/* 平均出货区（非 compact 才展示，赛季卡片太小不展示） */}
        {!compact && (
          avgInfo ? (
            // 有数据：展示均值 pill
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 4,
              marginBottom: 8,
              padding: '3px 10px', borderRadius: 20,
              background: '#FFF3D0', border: '1px solid #E8C060',
            }}>
              <span style={{ fontSize: 10, color: '#8B5C00', fontWeight: 700 }}>平均出货</span>
              <span style={{ fontSize: 15, color: '#C8830A', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                {avgInfo.avg}
              </span>
              <span style={{ fontSize: 10, color: '#8B5C00', fontWeight: 600 }}>
                次破盾 · {avgInfo.count}次记录
              </span>
            </div>
          ) : (
            // 无数据：灰色提示
            <div style={{
              marginBottom: 8, fontSize: 10,
              color: 'var(--text-muted)', fontStyle: 'italic',
            }}>
              你还没使用过该方案，暂无出货记录
            </div>
          )
        )}

        {/* 精灵头像行 */}
        <div className="plan-card-shinies">
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={compact ? 36 : 40} />
          ))}
        </div>

        {/* 底部提示（紧凑模式隐藏） */}
        {!compact && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            marginTop: 10, fontSize: 11, color: 'var(--text-muted)',
          }}>
            {isActive
              ? <span style={{ color: 'var(--cta)', fontWeight: 700 }}>继续刷取 →</span>
              : <span>点击进入 →</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}
