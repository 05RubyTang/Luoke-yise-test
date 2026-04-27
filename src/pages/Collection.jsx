import { useState } from 'react';
import { useStore } from '../store';
import { PLANS, ATTR_SHINIES, SEASON_SHINIES, findPlansForSpirit } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';
import { FruitLine } from '../components/FruitTag';

function getSpiritRecords(name, state) {
  return (state.completedTasks || [])
    .filter(t => t.resultSpirit === name && t.resultType !== 'abandoned')
    .map(t => ({
      taskId: t.id,
      planId: t.planId,
      shieldBreakCount: t.shieldBreakCount,
      ballsUsed: t.ballsUsed,
      completedAt: t.completedAt,
    }));
}

function PlanInfo({ plan }) {
  const cycleText = plan.spiritB
    ? `抓3只${plan.spiritA} → 抓3只${plan.spiritB} → 循环`
    : `抓3只${plan.spiritA} → 每3只一轮`;

  return (
    <div style={{
      background: 'var(--card-inner)',
      borderRadius: 10, padding: 12, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: '#F0E8D5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', padding: 3,
        }}>
          <PlanIcon plan={plan} size={20} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800 }}>{plan.type}方案</span>
        {plan.season && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20,
            background: 'rgba(244,143,177,0.15)', color: '#C0568A',
            border: '1px solid rgba(244,143,177,0.4)',
          }}>赛季奇遇</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 3 }}>
        果实：<FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={14} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 6 }}>循环：{cycleText}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>同池：{plan.shinies.join('、')}</div>
      {plan.season && plan.sanctuary && (
        <div style={{ fontSize: 11, color: '#5B9CF6', marginTop: 4 }}>
          📍 「{plan.sanctuary}」
        </div>
      )}
    </div>
  );
}

function RecordRow({ rec, index }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(rec.ballsUsed != null ? String(rec.ballsUsed) : '');
  const plan = PLANS.find(p => p.id === rec.planId);

  const handleSave = () => {
    const val = inputVal.trim();
    const num = val ? parseInt(val, 10) : null;
    dispatch({
      type: 'UPDATE_COMPLETED_BALLS',
      taskId: rec.taskId,
      ballsUsed: (num != null && !isNaN(num) && num >= 0) ? num : null,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ padding: '10px 0', borderTop: '1px solid var(--divider)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          {plan && <PlanIcon plan={plan} size={14} />}
          第{index + 1}次 · {plan?.type} · {rec.shieldBreakCount}次触发污染
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number" inputMode="numeric"
            value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="消耗球数" autoFocus
            className="input-field" style={{ flex: 1 }}
          />
          <button onClick={handleSave} style={{
            flexShrink: 0, padding: '10px 14px', border: '2px solid #2B2A2E',
            borderRadius: 'var(--radius-sm)', background: '#2B2A2E', color: '#FBF7EC',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 2px 0 #111014',
          }}>保存</button>
          <button onClick={() => setEditing(false)} style={{
            flexShrink: 0, padding: '10px 10px', border: '1.5px solid rgba(103,93,83,0.3)',
            borderRadius: 'var(--radius-sm)', background: '#FBF7EC',
            color: 'var(--text-light)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}>取消</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '10px 0', borderTop: '1px solid var(--divider)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-light)' }}>
          {plan && <PlanIcon plan={plan} size={14} />}
          第{index + 1}次 · {plan?.type}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cta)' }}>
          {rec.shieldBreakCount}次触发污染
        </span>
        {rec.ballsUsed != null
          ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{rec.ballsUsed} 咕噜球</span>
          : <span style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(160,144,128,0.7)' }}>待输入消耗咕噜球数量</span>
        }
      </div>
      <button onClick={() => setEditing(true)} style={{
        flexShrink: 0, border: '1px solid rgba(103,93,83,0.25)', background: 'var(--card-inner)',
        borderRadius: 4, padding: '4px 10px', fontSize: 10,
        color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
      }}>编辑</button>
    </div>
  );
}

// 精灵网格（可复用）
function SpiritGrid({ shinies, state, onSelect }) {
  return (
    <div className="collection-grid">
      {shinies.map(name => {
        const isObtained = state.spirits[name]?.obtained;
        return (
          <div
            key={name}
            className="collection-item"
            onClick={() => onSelect(name)}
          >
            {/* 图片 + 已获得角标叠层 */}
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <SpiritAvatar name={name} obtained={isObtained} size={64} showName={false} bare />
              {isObtained && (
                <span style={{
                  position: 'absolute', bottom: 0, right: 0,
                  fontSize: 10, fontWeight: 900, lineHeight: 1,
                  background: '#4B9C46', color: '#fff',
                  borderRadius: '50%', width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✓</span>
              )}
            </div>
            {/* 精灵名 */}
            <div style={{
              fontSize: 11, fontWeight: 800, color: isObtained ? 'var(--text)' : 'var(--text-muted)',
              textAlign: 'center', lineHeight: 1.2,
              width: '100%', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              padding: '0 2px',
            }}>{name}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Collection() {
  const { state } = useStore();
  const [tab, setTab] = useState('attr');        // 'attr' | 'season'
  const [selected, setSelected] = useState(null);

  // 各 Tab 的统计
  const attrObtained = ATTR_SHINIES.filter(s => state.spirits[s]?.obtained).length;
  const seasonObtained = SEASON_SHINIES.filter(s => state.spirits[s]?.obtained).length;

  const selectedPlans = selected ? findPlansForSpirit(selected) : [];
  const selectedRecords = selected ? getSpiritRecords(selected, state) : [];

  const TABS = [
    { key: 'attr',   label: '赛季异色', shinies: ATTR_SHINIES,   obtained: attrObtained },
    { key: 'season', label: '赛季奇遇', shinies: SEASON_SHINIES, obtained: seasonObtained },
  ];

  const currentTab = TABS.find(t => t.key === tab);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 标题 */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
          S1 赛季 · 异色&奇遇
        </div>
      </div>

      {/* Tab 切换 */}
      <div style={{
        display: 'flex', gap: 0, margin: '0 16px 0',
        border: '2px solid var(--divider)', borderRadius: 'var(--radius-sm)',
        overflow: 'hidden', background: 'var(--card-inner)',
      }}>
        {TABS.map((t, i) => {
          const isActive = tab === t.key;
          const obtained = t.obtained;
          const total = t.shinies.length;
          const isComplete = obtained === total && total > 0;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderRight: i < TABS.length - 1 ? '1.5px solid var(--divider)' : 'none',
                background: isActive ? 'var(--text)' : 'transparent',
                color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: 13, fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: isActive
                  ? (isComplete ? '#7EE87A' : 'rgba(251,247,236,0.65)')
                  : (isComplete ? 'var(--success)' : 'var(--text-muted)'),
              }}>
                {isComplete ? '(✓全收)' : `(${obtained}/${total})`}
              </span>
            </button>
          );
        })}
      </div>

      {/* 当前 Tab 说明 */}
      <div style={{ padding: '10px 16px 4px' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {tab === 'attr'
            ? '通过属性果实循环刷取，可产出的全部异色精灵'
            : '通过赛季奇遇果实（第六章任务解锁）刷取的专属精灵'}
        </span>
      </div>

      {/* 精灵网格 */}
      <SpiritGrid
        shinies={currentTab.shinies}
        state={state}
        onSelect={setSelected}
      />

      {/* 精灵详情弹窗 */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                border: '1.5px solid rgba(103,93,83,0.3)', background: 'var(--card-inner)',
                borderRadius: '50%', width: 28, height: 28, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-light)', cursor: 'pointer', padding: 0,
                flexShrink: 0,
              }}
            >✕</button>

            {/* 头部：头像 + 名字 + 状态 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingRight: 36 }}>
              <SpiritAvatar name={selected} obtained={state.spirits[selected]?.obtained} size={60} showName={false} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 5, fontFamily: 'var(--font-display)' }}>{selected}</div>
                <span style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 700,
                  padding: '2px 10px', borderRadius: 20,
                  ...(state.spirits[selected]?.obtained
                    ? { background: 'var(--success-dim)', color: 'var(--success)', border: '1.5px solid rgba(75,156,70,0.3)' }
                    : { background: 'var(--card-inner)', color: 'var(--text-muted)', border: '1px solid var(--divider)' })
                }}>
                  {state.spirits[selected]?.obtained ? '✓ 已获得' : '未获得'}
                </span>
              </div>
            </div>

            {/* 产出方式 */}
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-light)', marginBottom: 8, letterSpacing: 0.5 }}>
              产出方式
            </div>
            {selectedPlans.map(plan => <PlanInfo key={plan.id} plan={plan} />)}

            {/* 获取记录 */}
            {selectedRecords.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-light)', margin: '12px 0 4px', letterSpacing: 0.5 }}>
                  获取记录
                </div>
                {selectedRecords.map((rec, i) => (
                  <RecordRow key={rec.taskId} rec={rec} index={i} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
