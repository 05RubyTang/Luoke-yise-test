import { useStore } from '../store';
import { PLANS, getShinisByAttr } from '../data/plans';
import PlanCard from '../components/PlanCard';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';
import { FruitLine } from '../components/FruitTag';

// 用户自定义方案卡（在属性子方案页使用）
function UserPlanCard({ plan, spirits, onClick }) {
  const basePlan = PLANS.find(p => p.id === plan.attrId);
  const shinies = getShinisByAttr(plan.attrId);
  const obtainedCount = shinies.filter(s => spirits[s]?.obtained).length;
  const allObtained = shinies.length > 0 && obtainedCount === shinies.length;
  const headerBg = allObtained ? '#4B9C46' : '#2B2A2E';

  return (
    <div
      className="plan-card"
      onClick={onClick}
      style={{
        borderColor: allObtained ? '#4B9C46' : '#675D53',
        boxShadow: allObtained ? '0 2px 0 #4B9C46' : '0 2px 0 #675D53',
        padding: 0, overflow: 'hidden', background: '#FBF7EC',
      }}
    >
      {/* 表头 */}
      <div style={{
        background: headerBg, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {basePlan
          ? <PlanIcon plan={basePlan} size={24} style={{ flexShrink: 0 }} />
          : <span style={{ fontSize: 20, flexShrink: 0 }}>⭐</span>
        }
        {/* 方案名 + 自定义 tag 内联 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: '#FBF7EC', letterSpacing: 0.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{plan.label}</span>
          <span style={{
            flexShrink: 0,
            fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
            background: 'rgba(251,247,236,0.22)', color: '#FBF7EC',
            border: '1px solid rgba(251,247,236,0.4)',
          }}>自定义</span>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {obtainedCount}
            <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(251,247,236,0.7)', marginLeft: 1 }}>
              /{shinies.length}
            </span>
          </div>
          {allObtained && (
            <div style={{ fontSize: 9, color: '#FBF7EC', fontWeight: 700, marginTop: 2 }}>✓ 全收集</div>
          )}
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ padding: '12px 14px 10px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>
          <FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={14} />
        </div>

        {shinies.length > 0 && (
          <div className="plan-card-shinies" style={{ marginBottom: 10 }}>
            {shinies.map(name => (
              <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={40} />
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          fontSize: 11, color: 'var(--text-muted)',
        }}>
          <span>编辑方案 →</span>
        </div>
      </div>
    </div>
  );
}

export default function AttrPlanDetail({ planId, navigate, goBack }) {
  const { state } = useStore();
  const defaultPlan = PLANS.find(p => p.id === planId);
  const activePlanIds = (state.activeTasks || []).map(t => t.planId);
  const isActive = activePlanIds.includes(planId);

  // 筛选属于该属性的用户自定义方案
  const userPlans = (state.userPlanConfig || []).filter(p => p.attrId === planId);

  if (!defaultPlan) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
        找不到该方案
        <br />
        <button className="btn" onClick={goBack} style={{ marginTop: 16 }}>返回</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 0 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="page-header-title">
          {defaultPlan.type}方案
        </span>
      </div>

      {/* 说明条 */}
      <div className="card" style={{
        background: '#FFF9E0', border: '1.5px solid #C8A020',
        boxShadow: '0 2px 0 #C8A020', padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>💡</span>
        <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.8 }}>
          属性方案走<span style={{ fontWeight: 700 }}>系别池</span>逻辑，任意{defaultPlan.type}精灵的果实均有效。
          可根据你庇护所里的精灵自定义自己的方案。
        </div>
      </div>

      {/* ── 默认方案 ── */}
      <div style={{
        margin: '4px 16px 8px',
        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ display: 'inline-block', height: 1, flex: 1, background: 'var(--divider)' }} />
        推荐方案
        <span style={{ display: 'inline-block', height: 1, flex: 1, background: 'var(--divider)' }} />
      </div>

      <div className="animate-in">
        <PlanCard
          plan={defaultPlan}
          spirits={state.spirits}
          isActive={isActive}
          completedTasks={state.completedTasks}
          onClick={() => {
            if (isActive) navigate('recorder', { planId });
            else navigate('checklist', { planId });
          }}
        />
      </div>

      {/* ── 我的自定义方案（有才展示） ── */}
      {userPlans.length > 0 && (
        <>
          <div style={{
            margin: '4px 16px 8px',
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ display: 'inline-block', height: 1, flex: 1, background: 'var(--divider)' }} />
            我的自定义方案
            <span style={{ display: 'inline-block', height: 1, flex: 1, background: 'var(--divider)' }} />
          </div>

          {userPlans.map((plan, idx) => (
            <div
              key={plan.id}
              className="animate-in"
              style={{ animationDelay: `${(idx + 1) * 0.04}s` }}
            >
              <UserPlanCard
                plan={plan}
                spirits={state.spirits}
                onClick={() => navigate('planEditor', { userPlanId: plan.id })}
              />
            </div>
          ))}
        </>
      )}

      {/* ── 底部「新建我的方案」按钮（sticky，限制在滚动容器内，不溢出样机） ── */}
      <div style={{
        position: 'sticky', bottom: 0,
        paddingTop: 12, paddingBottom: 20,
        background: 'linear-gradient(to top, var(--bg) 75%, transparent)',
        zIndex: 10,
      }}>
        {/* 复用 .btn 自带的 margin: 8px 16px 实现左右等距居中 */}
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => navigate('planEditor', { basePlanId: planId })}
        >
          <span style={{ fontSize: 16, fontWeight: 900 }}>＋</span>
          新建我的方案
        </button>
      </div>
    </div>
  );
}
