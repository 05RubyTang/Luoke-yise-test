import { useState } from 'react';
import { useStore } from '../store';
import { ALL_SHINIES, PLANS, findPlansForSpirit } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';

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
  const fruitText = plan.fruitB
    ? `${plan.fruitA} + ${plan.fruitB}`
    : `${plan.fruitA}（单放）`;
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
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 3 }}>果实：{fruitText}</div>
      <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 6 }}>循环：{cycleText}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>同池：{plan.shinies.join('、')}</div>
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
      {/* 左侧：三行信息 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* 行1：方案信息 */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-light)' }}>
          {plan && <PlanIcon plan={plan} size={14} />}
          第{index + 1}次 · {plan?.type}
        </span>
        {/* 行2：触发污染次数 */}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cta)' }}>
          {rec.shieldBreakCount}次触发污染
        </span>
        {/* 行3：球数 */}
        {rec.ballsUsed != null
          ? <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{rec.ballsUsed} 咕噜球</span>
          : <span style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(160,144,128,0.7)' }}>待输入消耗咕噜球数量</span>
        }
      </div>
      {/* 右侧：编辑按钮 */}
      <button onClick={() => setEditing(true)} style={{
        flexShrink: 0, border: '1px solid rgba(103,93,83,0.25)', background: 'var(--card-inner)',
        borderRadius: 4, padding: '4px 10px', fontSize: 10,
        color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)',
      }}>编辑</button>
    </div>
  );
}

export default function Collection() {
  const { state } = useStore();
  const [selected, setSelected] = useState(null);
  const obtained = ALL_SHINIES.filter(s => state.spirits[s]?.obtained).length;

  const selectedPlans = selected ? findPlansForSpirit(selected) : [];
  const selectedRecords = selected ? getSpiritRecords(selected, state) : [];

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 标题 */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>S1 赛季 · 异色&奇遇</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>
            已收集 <span style={{ color: 'var(--gold)', fontWeight: 900 }}>{obtained}</span> / {ALL_SHINIES.length} 只
          </span>
          {obtained === ALL_SHINIES.length && obtained > 0 && (
            <span style={{
              fontSize: 11, color: 'var(--success)', fontWeight: 800,
              padding: '2px 10px', borderRadius: 20,
              background: 'var(--success-dim)', border: '1.5px solid rgba(75,156,70,0.3)',
            }}>全图鉴完成！</span>
          )}
        </div>
      </div>

      {/* 精灵网格 */}
      <div className="collection-grid">
        {ALL_SHINIES.map(name => {
          const isObtained = state.spirits[name]?.obtained;
          const records = getSpiritRecords(name, state);
          const latestRec = records[0];
          return (
            <div
              key={name}
              className="collection-item"
              onClick={() => setSelected(name)}
            >
              {/* 精灵头像（showName=false，名字在下方单独渲染，避免重复） */}
              <SpiritAvatar name={name} obtained={isObtained} size={56} showName={false} />

              {/* 精灵名 */}
              <div style={{
                fontSize: 11, fontWeight: 800, color: 'var(--text)',
                textAlign: 'center', lineHeight: 1.2,
                width: '100%', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                padding: '0 2px',
              }}>{name}</div>

              {/* 解锁状态 tag */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {isObtained ? (
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    padding: '2px 7px', borderRadius: 20,
                    background: 'rgba(75,156,70,0.12)', color: 'var(--success)',
                    border: '1px solid rgba(75,156,70,0.3)',
                  }}>✓ 已获得</span>
                ) : (
                  <span style={{
                    fontSize: 9, fontWeight: 600,
                    padding: '2px 7px', borderRadius: 20,
                    background: 'rgba(103,93,83,0.08)', color: 'var(--text-muted)',
                    border: '1px solid rgba(103,93,83,0.15)',
                  }}>未获得</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 精灵详情 —— 蒙层底部弹窗 */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* 拖拽把手 */}
            <div className="modal-handle" />

            {/* 关闭按钮 */}
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

          </div>
        </div>
      )}
    </div>
  );
}
