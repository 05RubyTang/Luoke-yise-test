import { useState } from 'react';
import { useStore } from '../store';
import { PLANS, getShinisByAttr } from '../data/plans';
import PlanCard from '../components/PlanCard';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';
import { FruitLine } from '../components/FruitTag';

/* ─── picker 模式：弹出方案选择 sheet ─────────────────────────────────────── */
function PlanSubPicker({ basePlan, userPlans, onSelect, onClose }) {
  const options = [
    { id: basePlan.id, label: `${basePlan.type}（推荐）`, fruitA: basePlan.fruitA, fruitB: basePlan.fruitB, isDefault: true },
    ...userPlans.map(p => ({ id: p.id, label: p.label, fruitA: p.fruitA, fruitB: p.fruitB, isDefault: false })),
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 201,
        background: 'var(--card)', borderRadius: '18px 18px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', maxHeight: '70%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--divider)' }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '2px 16px 10px', borderBottom: '1.5px solid var(--divider)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>选择具体方案</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>检测到你有 {userPlans.length} 套自定义方案</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0 20px' }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '12px 16px', border: 'none',
              background: 'transparent', borderBottom: '1px solid var(--divider)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <PlanIcon plan={basePlan} size={20} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{opt.label}</span>
                  {!opt.isDefault && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: 'rgba(103,93,83,0.12)', color: 'var(--text-muted)', border: '1px solid rgba(103,93,83,0.2)' }}>自定义</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <FruitLine fruitA={opt.fruitA} fruitB={opt.fruitB} size={13} />
                </div>
              </div>
              <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── 工具函数 ─────────────────────────────────────────────────────────────── */
function calcPlanAvgBreaks(planId, completedTasks) {
  if (!completedTasks?.length) return null;
  const relevant = completedTasks.filter(t => t.planId === planId && t.resultType !== 'abandoned' && t.shieldBreakCount != null);
  if (!relevant.length) return null;
  const avg = relevant.reduce((s, t) => s + t.shieldBreakCount, 0) / relevant.length;
  return { avg: Math.round(avg * 10) / 10, count: relevant.length };
}

function calcAttrAvgBreaks(attrId, userPlans, completedTasks) {
  if (!completedTasks?.length) return null;
  const userPlanIds = (userPlans || []).filter(p => p.attrId === attrId).map(p => p.id);
  const allIds = new Set([attrId, ...userPlanIds]);
  const relevant = completedTasks.filter(t => allIds.has(t.planId) && t.resultType !== 'abandoned' && t.shieldBreakCount != null);
  if (!relevant.length) return null;
  const avg = relevant.reduce((s, t) => s + t.shieldBreakCount, 0) / relevant.length;
  return { avg: Math.round(avg * 10) / 10, count: relevant.length };
}

// 判断属性方案的状态
function getPlanStatus(plan, spirits, activeTasks) {
  const shinies = getShinisByAttr(plan.id);
  const obtainedCount = shinies.filter(s => spirits[s]?.obtained).length;
  if (shinies.length > 0 && obtainedCount === shinies.length) return 'done';
  if ((activeTasks || []).some(t => t.planId === plan.id)) return 'active';
  return 'idle';
}

// 判断赛季方案的状态
function getSeasonPlanStatus(plan, spirits, activeTasks) {
  const allObtained = plan.shinies.length > 0 && plan.shinies.every(n => spirits[n]?.obtained);
  if (allObtained) return 'done';
  if ((activeTasks || []).some(t => t.planId === plan.id)) return 'active';
  return 'idle';
}

/* ─── 状态视觉配置 ─────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  active: { label: '刷取中', bg: '#C8830A', dotColor: '#FBF7EC', tagBg: 'rgba(251,247,236,0.25)', tagColor: '#FBF7EC', tagBorder: 'rgba(251,247,236,0.4)' },
  done:   { label: '已完成', bg: '#4B9C46', dotColor: '#FBF7EC', tagBg: 'rgba(251,247,236,0.25)', tagColor: '#FBF7EC', tagBorder: 'rgba(251,247,236,0.4)' },
  idle:   { label: '未开始', bg: '#2B2A2E', dotColor: 'rgba(251,247,236,0.4)', tagBg: 'rgba(251,247,236,0.12)', tagColor: 'rgba(251,247,236,0.6)', tagBorder: 'rgba(251,247,236,0.2)' },
};

/* ─── 方案卡（属性混抓）── 点击直接进二级页 ─────────────────────────────────── */
function AttrPlanCard({ plan, userPlans, spirits, completedTasks, activeTasks, onClick, pinned }) {
  const shinies = getShinisByAttr(plan.id);
  const obtainedCount = shinies.filter(s => spirits[s]?.obtained).length;
  const allObtained = shinies.length > 0 && obtainedCount === shinies.length;
  const status = getPlanStatus(plan, spirits, activeTasks);
  const avgInfo = calcAttrAvgBreaks(plan.id, userPlans, completedTasks);
  const myUserPlans = (userPlans || []).filter(p => p.attrId === plan.id);
  const totalPlanCount = 1 + myUserPlans.length;

  const headerBg = status === 'active' ? '#C8830A' : allObtained ? '#4B9C46' : '#2B2A2E';

  return (
    <div
      className="plan-card"
      onClick={onClick}
      style={{
        borderColor: status === 'active' ? '#C8830A' : allObtained ? '#4B9C46' : '#675D53',
        boxShadow: status === 'active' ? '0 2px 0 #C8830A' : allObtained ? '0 2px 0 #4B9C46' : '0 2px 0 #675D53',
        padding: 0, overflow: 'hidden', background: '#FBF7EC', cursor: 'pointer',
      }}
    >
      {/* 表头 */}
      <div style={{ background: headerBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PlanIcon plan={plan} size={28} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#FBF7EC', letterSpacing: 0.5, lineHeight: 1.2 }}>
            {plan.type}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(251,247,236,0.65)', marginTop: 2 }}>
            {totalPlanCount} 套方案{myUserPlans.length > 0 && `（含 ${myUserPlans.length} 套自定义）`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            {status === 'active' && (
              <div style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: 'rgba(251,247,236,0.25)', color: '#FBF7EC', border: '1px solid rgba(251,247,236,0.4)', marginBottom: 4, display: 'inline-block' }}>刷取中</div>
            )}
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {obtainedCount}<span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(251,247,236,0.7)', marginLeft: 1 }}>/{shinies.length}</span>
            </div>
            {allObtained && <div style={{ fontSize: 9, color: '#FBF7EC', fontWeight: 700, marginTop: 2 }}>✓ 全收集</div>}
          </div>
          <span style={{ fontSize: 16, color: 'rgba(251,247,236,0.7)' }}>›</span>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ padding: '10px 14px 12px' }}>
        {/* 推荐果实 + 平均破盾 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-light)' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>推荐：</span>
            <FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={14} />
          </div>
          {avgInfo
            ? <span style={{ fontSize: 9, color: '#8B5C00', fontWeight: 700, flexShrink: 0 }}>均 <span style={{ fontSize: 11, fontFamily: 'var(--font-display)' }}>{avgInfo.avg}</span> 次破盾</span>
            : <span style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', flexShrink: 0 }}>暂无记录</span>
          }
        </div>
        {/* 精灵头像 + 查看详情文字 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={36} />
          ))}
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            color: status === 'active' ? 'var(--cta)' : 'var(--text-muted)',
            fontWeight: status === 'active' ? 700 : 600,
          }}>
            {status === 'active' ? '继续刷取 →' : '查看详情 →'}
          </span>
        </div>
      </div>
    </div>
  );
}
/* ─── 方案卡（赛季奇遇）── 点击直接进二级页 ──────────────────────────────────── */
function SeasonPlanCard({ plan, spirits, completedTasks, activeTasks, onClick }) {
  const status = getSeasonPlanStatus(plan, spirits, activeTasks);
  const avgInfo = calcPlanAvgBreaks(plan.id, completedTasks);
  const allObtained = plan.shinies.length > 0 && plan.shinies.every(n => spirits[n]?.obtained);
  const obtainedCount = plan.shinies.filter(n => spirits[n]?.obtained).length;

  const headerBg = status === 'active' ? '#C8830A' : allObtained ? '#4B9C46' : '#2B2A2E';

  return (
    <div
      className="plan-card"
      onClick={onClick}
      style={{
        borderColor: status === 'active' ? '#C8830A' : allObtained ? '#4B9C46' : '#675D53',
        boxShadow: status === 'active' ? '0 2px 0 #C8830A' : allObtained ? '0 2px 0 #4B9C46' : '0 2px 0 #675D53',
        padding: 0, overflow: 'hidden', background: '#FBF7EC', cursor: 'pointer',
      }}
    >
      {/* 表头 */}
      <div style={{ background: headerBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PlanIcon plan={plan} size={28} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#FBF7EC', letterSpacing: 0.5, lineHeight: 1.2 }}>
            {plan.type}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(251,247,236,0.65)', marginTop: 2 }}>赛季奇遇 · 单果实刷取</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            {status === 'active' && (
              <div style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: 'rgba(251,247,236,0.25)', color: '#FBF7EC', border: '1px solid rgba(251,247,236,0.4)', marginBottom: 4, display: 'inline-block' }}>刷取中</div>
            )}
            <div style={{ fontSize: 16, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {obtainedCount}<span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(251,247,236,0.7)', marginLeft: 1 }}>/{plan.shinies.length}</span>
            </div>
            {allObtained && <div style={{ fontSize: 9, color: '#FBF7EC', fontWeight: 700, marginTop: 2 }}>✓ 已获得</div>}
          </div>
          <span style={{ fontSize: 16, color: 'rgba(251,247,236,0.7)' }}>›</span>
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ padding: '10px 14px 12px' }}>
        {/* 果实行 + 平均破盾 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-light)' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>果实：</span>
            <FruitLine fruitA={plan.fruitA} fruitB={null} size={14} />
          </div>
          {avgInfo
            ? <span style={{ fontSize: 9, color: '#8B5C00', fontWeight: 700, flexShrink: 0 }}>均 <span style={{ fontSize: 11, fontFamily: 'var(--font-display)' }}>{avgInfo.avg}</span> 次破盾</span>
            : <span style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', flexShrink: 0 }}>暂无记录</span>
          }
        </div>
        {/* 精灵头像 + 查看详情文字 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={36} />
          ))}
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            color: status === 'active' ? 'var(--cta)' : 'var(--text-muted)',
            fontWeight: status === 'active' ? 700 : 600,
          }}>
            {status === 'active' ? '继续刷取 →' : '查看详情 →'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── 筛选项 ────────────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',    label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'idle',   label: '未完成' },
  { key: 'done',   label: '已完成' },
];

/* ─── 主页面 ─────────────────────────────────────────────────────────────────── */
export default function PlanList({ navigate, mode = 'library', goBack }) {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');

  const attrPlans   = PLANS.filter(p => !p.season);
  const seasonPlans = PLANS.filter(p => p.season);

  // 计算每个属性方案的状态
  const attrWithStatus = attrPlans.map(p => ({
    plan: p,
    status: getPlanStatus(p, state.spirits, state.activeTasks),
  }));
  const seasonWithStatus = seasonPlans.map(p => ({
    plan: p,
    status: getSeasonPlanStatus(p, state.spirits, state.activeTasks),
  }));

  const allWithStatus = [...attrWithStatus, ...seasonWithStatus];

  // 顶部总览统计
  const activeCount  = allWithStatus.filter(x => x.status === 'active').length;
  const doneCount    = allWithStatus.filter(x => x.status === 'done').length;
  const idleCount    = allWithStatus.filter(x => x.status === 'idle').length;

  // 进行中的 planId（固定置顶）
  const activePlanIds = new Set((state.activeTasks || []).map(t => t.planId));

  // 过滤 + 排序（进行中 → 未开始 → 已完成，进行中组内固定置顶）
  const sortedAttr = [...attrWithStatus].sort((a, b) => {
    const order = { active: 0, idle: 1, done: 2 };
    return order[a.status] - order[b.status];
  });
  const sortedSeason = [...seasonWithStatus].sort((a, b) => {
    const order = { active: 0, idle: 1, done: 2 };
    return order[a.status] - order[b.status];
  });

  // 筛选（'idle' 在此包含 idle 和 active，因为它们都"未全收"——只保留语义清晰的：未完成 = idle）
  const filterFn = ({ status }) => {
    if (filter === 'all') return true;
    if (filter === 'active') return status === 'active';
    if (filter === 'idle')   return status === 'idle';
    if (filter === 'done')   return status === 'done';
    return true;
  };

  const filteredAttr   = sortedAttr.filter(filterFn);
  const filteredSeason = sortedSeason.filter(filterFn);

  // picker 模式仍用 PlanCard（行为不变）
  if (mode === 'picker') {
    return (
      <div style={{ position: 'relative', paddingBottom: 16 }}>
        <div style={{ padding: '20px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {goBack && <button className="back-btn" onClick={goBack} style={{ marginRight: 4 }}>←</button>}
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>选择刷取方案</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>选一套方案，开始新的刷取</div>
          </div>
        </div>
        {/* 属性混抓 */}
        <div style={{ padding: '4px 16px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>属性混抓</div>
        {attrPlans.map(plan => (
          <div key={plan.id} style={{ padding: '0 16px 0' }}>
            <PlanCard
              plan={plan} spirits={state.spirits}
              isActive={activePlanIds.has(plan.id)}
              completedTasks={state.completedTasks}
              onClick={() => navigate('checklist', { planId: plan.id, basePlanId: plan.id })}
            />
          </div>
        ))}
        {/* 自定义方案入口 */}
        <div
          className="plan-card animate-in"
          onClick={() => navigate('customChecklist')}
          style={{
            margin: '0 16px', borderColor: '#675D53', boxShadow: '0 2px 0 #675D53',
            padding: 0, overflow: 'hidden', background: '#FBF7EC', cursor: 'pointer',
          }}
        >
          <div style={{ background: '#2B2A2E', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✏️</div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#FBF7EC', letterSpacing: 0.5 }}>自定义方案</span>
            <span style={{ fontSize: 12, color: 'rgba(251,247,236,0.55)', fontWeight: 600 }}>点击填写 →</span>
          </div>
          <div style={{ padding: '10px 14px 12px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>手动填写果实组合，适合使用非标准方案的情况</div>
          </div>
        </div>
        {/* 赛季奇遇 */}
        <div style={{ padding: '12px 16px 6px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>赛季奇遇单抓</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px', padding: '0 16px' }}>
          {seasonPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} spirits={state.spirits}
              isActive={activePlanIds.has(plan.id)} compact
              completedTasks={state.completedTasks}
              onClick={() => navigate('checklist', { planId: plan.id })}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── library 模式（主流程）──
  return (
    <div style={{ paddingBottom: 24 }}>

      {/* 标题 */}
      <div style={{ padding: '20px 16px 10px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>果实方案库</div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>查看和管理你的果实方案</div>
      </div>

      {/* ── 顶部总览数据模块 ── */}
      <div style={{
        margin: '0 16px 14px',
        background: 'var(--card)',
        border: '1.5px solid var(--card-border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-card)',
        padding: '12px 14px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>整体进度</div>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* 已完成 */}
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--divider)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--success)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{doneCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>已完成</div>
          </div>
          {/* 刷取中 */}
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--divider)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#C8830A', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{activeCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>刷取中</div>
          </div>
          {/* 待开始 */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-light)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{idleCount}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>待开始</div>
          </div>
        </div>
      </div>

      {/* ── 筛选栏 ── */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          // 计数标注
          const count = f.key === 'all' ? allWithStatus.length
            : f.key === 'active' ? activeCount
            : f.key === 'done' ? doneCount
            : idleCount;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              flexShrink: 0,
              padding: '5px 12px',
              border: active ? '2px solid var(--text)' : '1.5px solid var(--divider)',
              borderRadius: 20,
              background: active ? 'var(--text)' : 'var(--card)',
              color: active ? 'var(--bg)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: active ? 800 : 600,
              fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {f.label}
              <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── 属性混抓方案列表 ── */}
      {(filteredAttr.length > 0 || filter === 'all') && (
        <>
          <div style={{ padding: '0 16px 7px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>属性混抓</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>{filteredAttr.length} 个</span>
          </div>
          {filteredAttr.map(({ plan }) => (
            <AttrPlanCard
              key={plan.id}
              plan={plan}
              userPlans={state.userPlanConfig}
              spirits={state.spirits}
              completedTasks={state.completedTasks}
              activeTasks={state.activeTasks}
              pinned={activePlanIds.has(plan.id)}
              onClick={() => navigate('attrPlanDetail', { planId: plan.id })}
            />
          ))}
          {/* ✏️ 自定义方案入口（始终显示在属性混抓列表末尾） */}
          {filter === 'all' && (
            <div
              className="plan-card"
              onClick={() => navigate('customChecklist')}
              style={{
                borderColor: '#675D53', boxShadow: '0 2px 0 #675D53',
                padding: 0, overflow: 'hidden', background: '#FBF7EC', cursor: 'pointer',
              }}
            >
              <div style={{ background: '#2B2A2E', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>✏️</div>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#FBF7EC', letterSpacing: 0.5 }}>
                  自定义方案
                </span>
                <span style={{ fontSize: 12, color: 'rgba(251,247,236,0.55)', fontWeight: 600 }}>点击填写 →</span>
              </div>
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  手动填写果实组合，适合使用非标准方案的情况
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── 赛季奇遇方案列表 ── */}
      {filteredSeason.length > 0 && (
        <>
          <div style={{ padding: filteredAttr.length > 0 ? '10px 16px 7px' : '0 16px 7px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>赛季奇遇</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>{filteredSeason.length} 个</span>
          </div>
          {filteredSeason.map(({ plan }) => (
            <SeasonPlanCard
              key={plan.id}
              plan={plan}
              spirits={state.spirits}
              completedTasks={state.completedTasks}
              activeTasks={state.activeTasks}
              onClick={() => navigate('checklist', { planId: plan.id })}
            />
          ))}
        </>
      )}

      {/* 空状态 */}
      {filteredAttr.length === 0 && filteredSeason.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
          暂无符合条件的方案
        </div>
      )}

    </div>
  );
}
