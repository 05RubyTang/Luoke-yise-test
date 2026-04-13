import SpiritAvatar from './SpiritAvatar';
import PlanIcon from './PlanIcon';

export default function PlanCard({ plan, spirits, isActive, onClick }) {
  const obtainedCount = plan.shinies.filter(s => spirits[s]?.obtained).length;
  const allObtained = obtainedCount === plan.shinies.length;

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
      }}
    >
      {/* ── 黑色表头 ── */}
      <div style={{
        background: headerBg,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* 属性图标（裸，无底色，原色直接显示在黑底上） */}
        <PlanIcon plan={plan} size={28} style={{ flexShrink: 0 }} />

        {/* 方案名 */}
        <span style={{
          flex: 1,
          fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#FBF7EC', letterSpacing: 0.5,
        }}>{plan.type}方案</span>

        {/* 刷取中 badge */}
        {isActive && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(251,247,236,0.25)', color: '#FBF7EC',
            border: '1px solid rgba(251,247,236,0.4)',
          }}>刷取中</span>
        )}

        {/* 收集计数 */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {obtainedCount}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(251,247,236,0.7)', marginLeft: 1 }}>
              /{plan.shinies.length}
            </span>
          </div>
          {allObtained && (
            <div style={{ fontSize: 9, color: '#FBF7EC', fontWeight: 700, marginTop: 2 }}>✓ 全收集</div>
          )}
        </div>
      </div>

      {/* ── 卡片内容区 ── */}
      <div style={{ padding: '12px 14px 10px' }}>
        {/* 果实说明 */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
          {plan.fruitA}{plan.fruitB ? ` + ${plan.fruitB}` : '（单放）'}
        </div>

        {/* 精灵头像行 */}
        <div className="plan-card-shinies">
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={40} />
          ))}
        </div>

        {/* 底部提示 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          marginTop: 10, fontSize: 11, color: 'var(--text-muted)',
        }}>
          {isActive
            ? <span style={{ color: 'var(--cta)', fontWeight: 700 }}>继续刷取 →</span>
            : <span>点击进入 →</span>
          }
        </div>
      </div>
    </div>
  );
}
