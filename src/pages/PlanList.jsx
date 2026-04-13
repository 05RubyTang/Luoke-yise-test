import { useStore } from '../store';
import { PLANS } from '../data/plans';
import PlanCard from '../components/PlanCard';

export default function PlanList({ navigate }) {
  const { state } = useStore();
  const activePlanIds = (state.activeTasks || []).map(t => t.planId);

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* 标题区 */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
          果实方案库
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>
          选择一套果实方案，开始刷取异色精灵
        </div>
      </div>

      {/* 说明条 */}
      <div className="card" style={{
        background: '#FFF9E0',
        border: '1.5px solid #C8A020',
        boxShadow: '0 2px 0 #C8A020',
        padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>💡</span>
        <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.8 }}>
          每80次触发污染必出一只异色。每次触发污染约 1.8% 概率直接出货。
        </div>
      </div>

      {/* 方案列表 */}
      {PLANS.map((plan, idx) => {
        const isActive = activePlanIds.includes(plan.id);
        return (
          <div key={plan.id} className="animate-in" style={{ animationDelay: `${idx * 0.04}s` }}>
            <PlanCard
              plan={plan}
              spirits={state.spirits}
              isActive={isActive}
              onClick={() => {
                if (isActive) {
                  navigate('recorder', { planId: plan.id });
                } else {
                  navigate('checklist', { planId: plan.id });
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
