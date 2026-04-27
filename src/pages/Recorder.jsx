import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';
import { FruitLine } from '../components/FruitTag';
import ProgressBar from '../components/ProgressBar';
import ShieldDots from '../components/ShieldDots';
import ResultModal from '../components/ResultModal';
import ShinySelectModal from '../components/ShinySelectModal';

export default function Recorder({ planId, navigate }) {
  const { state, dispatch } = useStore();
  const task = (state.activeTasks || []).find(t => t.planId === planId);
  const rawPlan = PLANS.find(p => p.id === planId)
    || (state.userPlanConfig || []).find(p => p.id === planId);
  // 标准化：确保 shinies 是数组、type/label 有值
  const plan = rawPlan ? {
    ...rawPlan,
    type:   rawPlan.type   || rawPlan.label || '自定义方案',
    shinies: Array.isArray(rawPlan.shinies) ? rawPlan.shinies : [],
  } : null;

  const [showResult, setShowResult] = useState(false);
  const [showShinySelect, setShowShinySelect] = useState(false);

  if (!plan || !task) return null;

  const handleResult = (result) => {
    if (result === 'failed') {
      dispatch({ type: 'RECORD_FAILED_BREAK', planId });
      setShowResult(false);
      return;
    }
    if (result === 'shiny') {
      dispatch({ type: 'RECORD_BREAK', result: 'shiny', planId });
      setShowResult(false);
      setShowShinySelect(true);
      return;
    }
    dispatch({ type: 'RECORD_BREAK', result, planId });
    setShowResult(false);
  };

  const handleShinySelect = (name, isPool) => {
    setShowShinySelect(false);
    navigate('report', { planId: plan.id, spiritName: name, isPool });
  };

  const handleExit = () => navigate('home');

  const handleAbandon = () => {
    if (confirm('确定要删除当前刷取记录吗？此操作不可恢复。')) {
      dispatch({ type: 'ABANDON_TASK', planId });
      navigate('home');
    }
  };

  const remaining = 80 - task.shieldBreakCount;
  const progressColor = task.shieldBreakCount >= 60 ? 'var(--cta)' : '#FBC839';

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* 顶部 header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="back-btn" onClick={handleExit}>←</button>
          {/* 属性图标 */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#F0E8D5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', padding: 3,
          }}>
            <PlanIcon plan={plan} size={26} />
          </div>
          <span className="page-header-title">
            {plan.season ? `${plan.type}刷取方案` : `${plan.type}方案`}
          </span>
        </div>
        <button
          onClick={handleAbandon}
          style={{
            border: '1.5px solid rgba(200,53,26,0.3)',
            background: '#FFF2EF', color: 'var(--danger)',
            fontSize: 12, fontFamily: 'var(--font-body)',
            padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', fontWeight: 700,
          }}
        >
          删除
        </button>
      </div>

      {/* 方案提示卡 */}
      <div className="card recorder-plan-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* 深色标题条 */}
        <div style={{
          background: '#2B2A2E',
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'rgba(255,255,255,0.13)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, padding: 4,
            }}>
              <PlanIcon plan={plan} size={26} />
            </div>
            <div>
              <div style={{
                fontSize: 17, fontWeight: 900, color: '#fff',
                fontFamily: 'var(--font-display)', letterSpacing: 0.5, lineHeight: 1.2,
              }}>
                {plan.season ? `${plan.type}刷取方案` : '3+3 刷取方案'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: 600 }}>
                {plan.shinies.length} 套方案
              </div>
            </div>
          </div>
          {/* 右：已获得/总数 */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
              {plan.shinies.filter(n => state.spirits[n]?.obtained).length}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              /{plan.shinies.length}
            </span>
          </div>
        </div>
        {/* 正常内容区 */}
        <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 3 }}>
          <FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={14} />
        </div>
        {plan.season ? (
          plan.sanctuary && (
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
              <span style={{ color: '#5B9CF6', fontWeight: 700 }}>📍</span>
              {' '}「{plan.sanctuary}」
            </div>
          )
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
            抓3只{plan.spiritA}
            {plan.spiritB ? ` → 抓3只${plan.spiritB} → 循环` : ' → 每3只一轮'}
          </div>
        )}
        {/* 异色精灵解锁进度 */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>
          异色精灵解锁进度
          <span style={{ fontWeight: 400, marginLeft: 6 }}>
            {plan.shinies.filter(n => state.spirits[n]?.obtained).length}/{plan.shinies.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {plan.shinies.map(name => {
            const obtained = state.spirits[name]?.obtained;
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <SpiritAvatar name={name} obtained={obtained} size={32} showName={false} />
                <span style={{
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                  color: obtained ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {obtained ? '✓ 已获得' : '🔒 未解锁'}
                </span>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* 果冻/星尘虫提示条 */}
      <div style={{
        margin: '0 16px 4px',
        padding: '8px 12px',
        borderRadius: 10,
        background: '#FFF9E0',
        border: '1.5px solid #C8A020',
        display: 'flex', alignItems: 'flex-start', gap: 8,
        fontSize: 12, color: 'var(--text-light)', lineHeight: 1.7,
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.6 }}>⚠️</span>
        <span>
          刷出<span style={{ fontWeight: 800, color: '#C8830A' }}>果冻 / 星尘虫</span>污染时，
          <span style={{ fontWeight: 800 }}>不计入保底</span>，无需点击「记录破盾」。
        </span>
      </div>

      {/* ★ 记录触发污染大按钮 ★ */}
      <button
        className="recorder-btn-break"
        onClick={() => setShowResult(true)}
      >
        <img src={`${import.meta.env.BASE_URL}break-shield.png`} alt="触发污染" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        <span>记录一次触发污染</span>
      </button>

      {/* 工具栏 */}
      <div className="recorder-tools">
        <button
          className="recorder-undo"
          disabled={task.shieldBreaks.length === 0}
          onClick={() => dispatch({ type: 'UNDO_BREAK', planId })}
        >
          ↩ 撤销上一次
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          已记录 <span style={{ color: 'var(--text)', fontWeight: 800 }}>{task.shieldBreaks.length}</span> 次
        </div>
      </div>

      {/* 保底进度 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>触发污染保底进度</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: progressColor, lineHeight: 1 }}>
              {task.shieldBreakCount}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/80</span>
          </div>
        </div>
        <ProgressBar current={task.shieldBreakCount} total={80} color={progressColor} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11 }}>
          <span style={{ color: 'var(--text-muted)' }}>每次 1.8% 概率 · 80次必出</span>
          <span style={{
            color: remaining <= 20 ? 'var(--cta)' : 'var(--text-muted)',
            fontWeight: remaining <= 20 ? 800 : 500,
          }}>
            还差 {remaining} 次
          </span>
        </div>
      </div>

      {/* 触发污染色块 */}
      {task.shieldBreaks.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>触发污染记录</span>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 600 }}>
              <span style={{ color: 'var(--success)' }}>
                原色精灵 {task.shieldBreaks.filter(b => b.result === 'original').length}
              </span>
              <span style={{ color: 'var(--polluted)' }}>
                污染精灵 {task.shieldBreaks.filter(b => b.result === 'polluted').length}
              </span>
              <span style={{ color: 'var(--gold)' }}>
                🌟异色精灵 {task.shieldBreaks.filter(b => b.result === 'shiny').length}
              </span>
            </div>
          </div>
          <ShieldDots breaks={task.shieldBreaks} />
        </div>
      )}

      {showResult && (
        <ResultModal onResult={handleResult} onClose={() => setShowResult(false)} />
      )}
      {showShinySelect && (
        <ShinySelectModal plan={plan} onSelect={handleShinySelect} onClose={() => setShowShinySelect(false)} />
      )}
    </div>
  );
}
