import { useState } from 'react';
import { useStore } from '../store';
import { PLANS, getShinisByAttr } from '../data/plans';
import PlanCard from '../components/PlanCard';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';
import { FruitLine } from '../components/FruitTag';

/* ── picker 模式：属性方案有自定义子方案时弹出的选择 sheet ── */
function PlanSubPicker({ basePlan, userPlans, spirits, onSelect, onClose }) {
  const options = [
    // 默认方案
    { id: basePlan.id, label: `${basePlan.type}（推荐）`, fruitA: basePlan.fruitA, fruitB: basePlan.fruitB, isDefault: true },
    // 用户自定义方案
    ...userPlans.map(p => ({ id: p.id, label: p.label, fruitA: p.fruitA, fruitB: p.fruitB, isDefault: false })),
  ];

  return (
    <>
      {/* 遮罩 */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 101,
        background: 'var(--card)', borderRadius: '18px 18px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '70%',
      }}>
        {/* 把手 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--divider)' }} />
        </div>
        {/* 标题 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '2px 16px 10px', borderBottom: '1.5px solid var(--divider)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              选择具体方案
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              检测到你有 {userPlans.length} 套自定义方案
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>
        {/* 列表 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0 20px' }}>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '12px 16px', border: 'none',
                background: 'transparent', borderBottom: '1px solid var(--divider)',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <PlanIcon plan={basePlan} size={20} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    {opt.label}
                  </span>
                  {!opt.isDefault && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10,
                      background: 'rgba(103,93,83,0.12)', color: 'var(--text-muted)',
                      border: '1px solid rgba(103,93,83,0.2)',
                    }}>自定义</span>
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

/* 属性混抓专属 icon */
function AttrIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} fill={color}>
      <path d="M512 937.353846c-234.732308 0-425.353846-190.621538-425.353846-425.353846 0-17.329231 14.178462-31.507692 31.507692-31.507692h236.307692c17.329231 0 31.507692 14.178462 31.507693 31.507692 0 69.316923 56.713846 126.030769 126.030769 126.030769s126.030769-56.713846 126.030769-126.030769c0-17.329231 14.178462-31.507692 31.507693-31.507692h236.307692c17.329231 0 31.507692 14.178462 31.507692 31.507692 0 234.732308-190.621538 425.353846-425.353846 425.353846zM151.236923 543.507692c15.753846 185.107692 171.716923 330.830769 360.763077 330.83077s345.009231-145.723077 360.763077-330.83077H698.683077C683.716923 632.516923 605.735385 701.046154 512 701.046154s-171.716923-68.529231-186.683077-157.538462H151.236923z" />
      <path d="M512 118.153846c-217.403077 0-393.846154 176.443077-393.846154 393.846154h236.307692c0-86.646154 70.892308-157.538462 157.538462-157.538462s157.538462 70.892308 157.538462 157.538462h236.307692c0-217.403077-176.443077-393.846154-393.846154-393.846154z" />
      <path d="M905.846154 543.507692H669.538462c-17.329231 0-31.507692-14.178462-31.507693-31.507692 0-69.316923-56.713846-126.030769-126.030769-126.030769s-126.030769 56.713846-126.030769 126.030769c0 17.329231-14.178462 31.507692-31.507693 31.507692H118.153846c-17.329231 0-31.507692-14.178462-31.507692-31.507692 0-234.732308 190.621538-425.353846 425.353846-425.353846s425.353846 190.621538 425.353846 425.353846c0 17.329231-14.178462 31.507692-31.507692 31.507692z m-207.163077-63.015384h174.867692C857.009231 295.384615 701.046154 149.661538 512 149.661538S166.990769 295.384615 151.236923 480.492308h174.867692C340.283077 391.483077 418.264615 322.953846 512 322.953846s171.716923 68.529231 186.683077 157.538462z" />
      <path d="M512 701.046154c-103.975385 0-189.046154-85.070769-189.046154-189.046154s85.070769-189.046154 189.046154-189.046154 189.046154 85.070769 189.046154 189.046154-85.070769 189.046154-189.046154 189.046154z m0-315.076923c-69.316923 0-126.030769 56.713846-126.030769 126.030769s56.713846 126.030769 126.030769 126.030769 126.030769-56.713846 126.030769-126.030769-56.713846-126.030769-126.030769-126.030769z" />
      <path d="M512 512m-78.769231 0a78.769231 78.769231 0 1 0 157.538462 0 78.769231 78.769231 0 1 0-157.538462 0Z" />
    </svg>
  );
}

/* 奇遇单抓专属 icon */
function SeasonIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} fill={color}>
      <path d="M853.8 456.9l-134 149.4c-0.4 0.4-0.6 1-0.5 1.6l25.3 211.6v0.4c-0.8 10.8-4.3 21.4-12 29.7-15.1 15.9-37.5 20.5-55 9.1 3.3 0.5-0.7-1.4 0 0l-175.2-85.9c-0.6-0.3-1.3-0.3-1.8 0l-169.2 83-3.1 1.5c0.1-0.4 0.1 0 0 0-2.1 1.4-4.3 2.5-6.5 3.5-16.4 6.9-35.8 2.8-49.1-11.2-10-10.5-14.3-24.8-13-38.5l-0.1-2.4 0.1-0.5c5.9-49.4 20.9-97.2 44.5-140.9 51.5-95.4 137.7-219.5 257-271.5 2.2-1 1.3-4.3-1.1-3.9-47.4 6.4-199.9 36.8-313.5 170.4-0.8 1-2.3 1-3.1 0L152 460.6h0.2c-15-14.9-18.9-39-8.2-58.6 7.1-12.9 19.1-21 32.1-23.2 0.3 0 0.4-0.1 0.4-0.2 0.2-0.7 1-1.1 1.8-1.2l187.3-37.6c0.6-0.1 1.1-0.5 1.4-1.1l92.7-175.4c0.1-0.1 0.1 0.1 0.2 0 5.4-12.6 15.9-22.7 29.6-26.6 20.7-5.9 41.8 4.3 51.7 23.4v-0.1l94.3 178.6c0.3 0.6 0.8 0.9 1.4 1.1l188.2 37.8c0.6 0.1 1.4 0.4 1.6 1 0 0.1 0.2 0.2 0.4 0.2 13 2.2 24.9 10.3 32.1 23.2 10.1 18.2 7 40-5.4 55z" />
    </svg>
  );
}

const TABS = [
  { key: 'attr',   label: '属性混抓', icon: AttrIcon },
  { key: 'season', label: '奇遇单抓', icon: SeasonIcon },
];

// 单个方案 id 的平均破盾次数
function calcPlanAvgBreaks(planId, completedTasks) {
  if (!completedTasks?.length) return null;
  const relevant = completedTasks.filter(
    t => t.planId === planId && t.resultType !== 'abandoned' && t.shieldBreakCount != null
  );
  if (!relevant.length) return null;
  const avg = relevant.reduce((s, t) => s + t.shieldBreakCount, 0) / relevant.length;
  return { avg: Math.round(avg), count: relevant.length };
}

// 该属性下（默认方案 + 用户方案）的综合平均破盾次数
function calcAttrAvgBreaks(attrId, userPlans, completedTasks) {
  if (!completedTasks?.length) return null;
  const userPlanIds = (userPlans || []).filter(p => p.attrId === attrId).map(p => p.id);
  const allIds = new Set([attrId, ...userPlanIds]);
  const relevant = completedTasks.filter(
    t => allIds.has(t.planId) && t.resultType !== 'abandoned' && t.shieldBreakCount != null
  );
  if (!relevant.length) return null;
  const avg = relevant.reduce((s, t) => s + t.shieldBreakCount, 0) / relevant.length;
  return { avg: Math.round(avg), count: relevant.length };
}

// library 模式：属性子方案库入口卡
function AttrEntryCard({ plan, userPlans, spirits, completedTasks, activeTasks, onClick }) {
  const shinies = getShinisByAttr(plan.id);
  const obtainedCount = shinies.filter(s => spirits[s]?.obtained).length;
  const allObtained = shinies.length > 0 && obtainedCount === shinies.length;

  const myUserPlans = (userPlans || []).filter(p => p.attrId === plan.id);
  const totalPlanCount = 1 + myUserPlans.length;
  const avgInfo = calcAttrAvgBreaks(plan.id, userPlans, completedTasks);

  // 「主方案」：该属性下是否有进行中任务
  const activeTask = (activeTasks || []).find(t => t.planId === plan.id);
  const isActive = !!activeTask;
  const headerBg = isActive ? '#C8830A' : allObtained ? '#4B9C46' : '#2B2A2E';

  // 所有方案的果实摘要（默认 + 用户），最多显示3条，超出折叠
  const allPlanSummaries = [
    // 默认方案
    {
      id: plan.id,
      label: `${plan.type}（推荐）`,
      fruitA: plan.fruitA,
      fruitB: plan.fruitB,
      isDefault: true,
    },
    // 用户方案
    ...myUserPlans.map(p => ({
      id: p.id,
      label: p.label,
      fruitA: p.fruitA,
      fruitB: p.fruitB,
      isDefault: false,
    })),
  ];

  return (
    <div
      className="plan-card"
      onClick={onClick}
      style={{
        borderColor: isActive ? '#C8830A' : allObtained ? '#4B9C46' : '#675D53',
        boxShadow: isActive ? '0 2px 0 #C8830A' : allObtained ? '0 2px 0 #4B9C46' : '0 2px 0 #675D53',
        padding: 0, overflow: 'hidden', background: '#FBF7EC',
      }}
    >
      {/* ── 表头 ── */}
      <div style={{
        background: headerBg, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <PlanIcon plan={plan} size={28} style={{ flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: '#FBF7EC', letterSpacing: 0.5, lineHeight: 1.2,
          }}>{plan.type}</div>
          <div style={{ fontSize: 10, color: 'rgba(251,247,236,0.65)', marginTop: 2 }}>
            {totalPlanCount} 套方案
            {myUserPlans.length > 0 && `（含 ${myUserPlans.length} 套自定义）`}
          </div>
        </div>

        {/* 状态 + 收集进度 */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {isActive && (
            <div style={{
              fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20,
              background: 'rgba(251,247,236,0.25)', color: '#FBF7EC',
              border: '1px solid rgba(251,247,236,0.4)', marginBottom: 4,
              display: 'inline-block',
            }}>刷取中</div>
          )}
          <div style={{ fontSize: 16, fontWeight: 900, color: '#FBF7EC', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
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

      {/* ── 内容区 ── */}
      <div style={{ padding: '10px 14px 12px' }}>

        {/* 果实方案列表（每套一行，最多展示3套；含该方案的平均出货） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {allPlanSummaries.slice(0, 3).map(p => {
            const isRunning = p.id === plan.id && isActive;
            // 该方案的平均出货
            const pAvg = calcPlanAvgBreaks(p.id, completedTasks);
            return (
              <div key={p.id} style={{
                borderRadius: 8,
                background: isRunning
                  ? 'rgba(200,131,10,0.1)'
                  : p.isDefault ? 'rgba(200,131,10,0.05)' : 'var(--card-inner)',
                border: isRunning
                  ? '1.5px solid rgba(200,131,10,0.35)'
                  : p.isDefault ? '1px solid rgba(200,131,10,0.15)' : '1px solid var(--divider)',
                padding: '7px 10px',
              }}>
                {/* 第一行：tag + 方案名 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  {isRunning && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 10,
                      background: '#C8830A', color: '#FBF7EC', flexShrink: 0,
                    }}>刷取中</span>
                  )}
                  {!p.isDefault && !isRunning && (
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 10,
                      background: 'rgba(103,93,83,0.12)', color: 'var(--text-muted)',
                      border: '1px solid rgba(103,93,83,0.2)', flexShrink: 0,
                    }}>自定义</span>
                  )}
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: isRunning ? '#C8830A' : 'var(--text)',
                    fontFamily: 'var(--font-display)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{p.label}</span>
                </div>
                {/* 第二行：果实内容 + 平均出货小字 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-light)', fontWeight: 600,
                    flex: 1, overflow: 'hidden',
                  }}>
                    <FruitLine fruitA={p.fruitA} fruitB={p.fruitB} size={14} />
                  </span>
                  {pAvg ? (
                    <span style={{ fontSize: 9, color: '#8B5C00', fontWeight: 700, flexShrink: 0 }}>
                      均 <span style={{ fontSize: 11, fontFamily: 'var(--font-display)' }}>{pAvg.avg}</span> 次破盾
                    </span>
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', flexShrink: 0 }}>
                      暂无记录
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {allPlanSummaries.length > 3 && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>
              还有 {allPlanSummaries.length - 3} 套方案...
            </div>
          )}
        </div>

        {/* 主方案可产出精灵头像行 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={spirits[name]?.obtained} size={36} />
          ))}
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            color: isActive ? 'var(--cta)' : 'var(--text-muted)',
            fontWeight: isActive ? 700 : 600,
          }}>
            {isActive ? '继续刷取 →' : '查看方案 →'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PlanList({ navigate, mode = 'library', goBack }) {
  const { state } = useStore();
  const [tab, setTab] = useState('attr');
  const [pickerPlan, setPickerPlan] = useState(null); // picker模式弹出的属性方案
  const activePlanIds = (state.activeTasks || []).map(t => t.planId);

  const attrPlans   = PLANS.filter(p => !p.season);
  const seasonPlans = PLANS.filter(p => p.season);
  const currentPlans = tab === 'attr' ? attrPlans : seasonPlans;

  return (
    <div style={{ position: 'relative', paddingBottom: 16 }}>
      {/* 标题区 */}
      <div style={{ padding: '20px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {mode === 'picker' && goBack && (
          <button className="back-btn" onClick={goBack} style={{ marginRight: 4 }}>←</button>
        )}
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {mode === 'picker' ? '选择刷取方案' : '果实方案库'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>
            {mode === 'picker'
              ? '选一套方案，开始新的刷取'
              : '查看和管理你的果实方案'}
          </div>
        </div>
      </div>

      {/* 顶部 Tab */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 4px' }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10,
                border: active ? '1.5px solid var(--text)' : '1.5px solid var(--divider)',
                background: active ? 'var(--text)' : 'var(--card)',
                color: active ? 'var(--bg)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: active ? 800 : 600,
                fontFamily: 'var(--font-display)', cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? '0 2px 0 #111014' : '0 2px 0 var(--divider)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {t.icon && <t.icon size={17} color={active ? 'var(--bg)' : 'var(--text-muted)'} />}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 说明条 */}
      <div className="card" style={{
        background: '#FFF9E0', border: '1.5px solid #C8A020',
        boxShadow: '0 2px 0 #C8A020', padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>💡</span>
        <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.8 }}>
          {tab === 'attr' ? (
            <>
              属性抓法适合没有拿到奇遇精灵果实的小洛克
              {mode === 'library' && (
                <span style={{ color: '#C8830A', fontWeight: 700 }}>，点击方案可自定义你的果实组合</span>
              )}
            </>
          ) : (
            <>
              赛季奇遇果实通过 <span style={{ fontWeight: 700 }}>第六章赛季任务</span> 获得，捕捉2只污染血脉的对应精灵即可获取。<br />
              <span style={{ color: '#C8830A', fontWeight: 700 }}>每种果实只针对该精灵，为单果实刷取。</span>
            </>
          )}
        </div>
      </div>

      {/* ── 方案列表 ── */}
      {tab === 'attr' ? (
        <>
          {currentPlans.map((plan, idx) => {
            const isActive = activePlanIds.includes(plan.id);
            return (
              <div key={plan.id} className="animate-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                {mode === 'library' ? (
                  <AttrEntryCard
                    plan={plan}
                    userPlans={state.userPlanConfig}
                    spirits={state.spirits}
                    completedTasks={state.completedTasks}
                    activeTasks={state.activeTasks}
                    onClick={() => navigate('attrPlanDetail', { planId: plan.id })}
                  />
                ) : (
                  <PlanCard
                    plan={plan}
                    spirits={state.spirits}
                    isActive={isActive}
                    completedTasks={state.completedTasks}
                    onClick={() => {
                      // picker 模式：有自定义方案则弹 sheet，否则直接进
                      const myUserPlans = (state.userPlanConfig || []).filter(p => p.attrId === plan.id);
                      if (myUserPlans.length > 0) {
                        setPickerPlan({ basePlan: plan, userPlans: myUserPlans });
                      } else {
                        navigate('checklist', { planId: plan.id });
                      }
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* picker 模式：自定义方案入口卡（黑色表头风格） */}
          {mode === 'picker' && (
            <div
              className="plan-card animate-in"
              onClick={() => navigate('customChecklist')}
              style={{
                animationDelay: `${currentPlans.length * 0.04}s`,
                borderColor: '#675D53', boxShadow: '0 2px 0 #675D53',
                padding: 0, overflow: 'hidden', background: '#FBF7EC', cursor: 'pointer',
              }}
            >
              {/* 深色表头 */}
              <div style={{
                background: '#2B2A2E', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>✏️</div>
                <span style={{
                  flex: 1, fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)',
                  color: '#FBF7EC', letterSpacing: 0.5,
                }}>自定义方案</span>
                <span style={{ fontSize: 12, color: 'rgba(251,247,236,0.55)', fontWeight: 600 }}>点击填写 →</span>
              </div>
              {/* 内容区 */}
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  手动填写果实组合，适合使用非标准方案的情况
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // 奇遇单抓：两列网格
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0 8px', padding: '0 16px',
        }}>
          {currentPlans.map((plan, idx) => {
            const isActive = activePlanIds.includes(plan.id);
            return (
              <div key={plan.id} className="animate-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                <PlanCard
                  plan={plan}
                  spirits={state.spirits}
                  isActive={isActive}
                  compact
                  completedTasks={state.completedTasks}
                  onClick={() => {
                    if (mode === 'picker') {
                      navigate('checklist', { planId: plan.id });
                    } else {
                      if (isActive) navigate('recorder', { planId: plan.id });
                      else navigate('checklist', { planId: plan.id });
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* picker 模式：属性子方案选择 sheet */}
      {pickerPlan && (
        <PlanSubPicker
          basePlan={pickerPlan.basePlan}
          userPlans={pickerPlan.userPlans}
          spirits={state.spirits}
          onSelect={(planId) => {
            setPickerPlan(null);
            const isActive = activePlanIds.includes(planId);
            if (isActive) navigate('recorder', { planId });
            else navigate('checklist', { planId });
          }}
          onClose={() => setPickerPlan(null)}
        />
      )}
    </div>
  );
}
