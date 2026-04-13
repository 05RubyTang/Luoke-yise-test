import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} · ${hh}:${mi}`;
}

/** 单次刷取历史卡片 */
function HistoryCard({ task, index }) {
  const { dispatch } = useStore();
  const plan = PLANS.find(p => p.id === task.planId);
  const isSuccess = task.resultType !== 'abandoned';
  const isPool = task.resultType === 'pool';
  const breakdowns = task.breakdowns || {};
  const polluted = breakdowns.polluted || 0;
  const original = breakdowns.original || 0;
  const shiny = breakdowns.shiny || 0;

  const [editingBalls, setEditingBalls] = useState(false);
  const [ballsInput, setBallsInput] = useState(task.ballsUsed != null ? String(task.ballsUsed) : '');

  const handleSaveBalls = () => {
    const val = ballsInput.trim();
    const num = val ? parseInt(val, 10) : null;
    dispatch({
      type: 'UPDATE_COMPLETED_BALLS',
      taskId: task.id,
      ballsUsed: (num != null && !isNaN(num) && num >= 0) ? num : null,
    });
    setEditingBalls(false);
  };

  // 结果标签颜色
  const resultStyle = isSuccess
    ? { background: 'rgba(75,156,70,0.12)', color: '#4B9C46', border: '1px solid rgba(75,156,70,0.3)' }
    : { background: 'rgba(103,93,83,0.08)', color: '#A09080', border: '1px solid rgba(103,93,83,0.15)' };

  return (
    <div className="card animate-in" style={{ animationDelay: `${index * 0.04}s` }}>
      {/* 顶部行：精灵头像 + 名称 + 时间 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {/* 精灵图 or 方案属性图标 */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#F0E8D5', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {isSuccess
            ? <SpiritAvatar name={task.resultSpirit} obtained size={44} showName={false} />
            : plan ? <PlanIcon plan={plan} size={30} /> : <span style={{ fontSize: 22 }}>?</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 精灵名 / 中断标题 */}
          <div style={{
            fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: isSuccess ? '#2B2A2E' : '#A09080',
            marginBottom: 3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isSuccess ? task.resultSpirit : `${plan?.type || '?'}方案 · 未完成`}
          </div>
          {/* 时间 */}
          <div style={{ fontSize: 11, color: '#A09080', fontWeight: 500 }}>
            {formatDateTime(task.completedAt)}
          </div>
        </div>

        {/* 编辑球数按钮 */}
        <button
          onClick={() => setEditingBalls(true)}
          style={{
            flexShrink: 0, border: '1px solid rgba(103,93,83,0.25)',
            background: 'var(--card-inner)', borderRadius: 6,
            padding: '4px 10px', fontSize: 10, fontWeight: 700,
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >✎ 编辑</button>
      </div>

      {/* 出货标签横幅（仅成功时） */}
      {isSuccess && (
        <div style={{
          background: isPool ? '#2B2A2E' : '#7E57C2',
          borderRadius: 8, padding: '6px 12px', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6,
        }}>
          {plan && <PlanIcon plan={plan} size={16} style={{ filter: 'brightness(2)' }} />}
          <span style={{
            fontSize: 12, fontWeight: 800, color: '#FBF7EC',
            fontFamily: 'var(--font-display)', letterSpacing: 1,
          }}>
            {isPool ? `${plan?.type || ''}方案出货` : '歪池出货'}
          </span>
        </div>
      )}

      {/* 数据网格 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#F0E8D5', borderRadius: 10,
        overflow: 'hidden', marginBottom: 8,
      }}>
        {[
          { label: '触发污染次数', value: task.shieldBreakCount, color: '#D4560A' },
          { label: '污染精灵', value: polluted, color: '#8B4BB8' },
          { label: '原色精灵', value: original, color: '#4B9C46' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '10px 4px', textAlign: 'center',
            borderRight: '1px solid rgba(103,93,83,0.12)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: item.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {item.value}
            </div>
            <div style={{ fontSize: 9, color: '#A09080', marginTop: 4, fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
        {/* 消耗球数格（可点击编辑） */}
        <div
          onClick={() => setEditingBalls(true)}
          style={{
            padding: '10px 4px', textAlign: 'center', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 900, color: '#2B2A2E', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
            {task.ballsUsed != null ? task.ballsUsed : '—'}
          </div>
          <div style={{ fontSize: 9, color: '#A09080', marginTop: 4, fontWeight: 600 }}>
            消耗球数 <span style={{ color: 'rgba(103,93,83,0.5)' }}>✎</span>
          </div>
        </div>
      </div>

      {/* 内联球数编辑区 */}
      {editingBalls && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="number" inputMode="numeric"
            value={ballsInput} onChange={e => setBallsInput(e.target.value)}
            placeholder="输入消耗咕噜球数量" autoFocus
            className="input-field" style={{ flex: 1 }}
          />
          <button onClick={handleSaveBalls} style={{
            flexShrink: 0, padding: '10px 14px',
            border: '2px solid #2B2A2E', borderRadius: 'var(--radius-sm)',
            background: '#2B2A2E', color: '#FBF7EC',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 2px 0 #111014',
          }}>保存</button>
          <button onClick={() => setEditingBalls(false)} style={{
            flexShrink: 0, padding: '10px 10px',
            border: '1.5px solid rgba(103,93,83,0.3)', borderRadius: 'var(--radius-sm)',
            background: '#FBF7EC', color: 'var(--text-light)',
            fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer',
          }}>取消</button>
        </div>
      )}

      {/* 触发污染明细小标签行 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
          background: 'rgba(212,86,10,0.08)', color: '#D4560A',
          border: '1px solid rgba(212,86,10,0.2)',
        }}>💀 触发污染 {task.shieldBreakCount}</span>
        {polluted > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(139,75,184,0.08)', color: '#8B4BB8',
            border: '1px solid rgba(139,75,184,0.2)',
          }}>污染精灵 {polluted}</span>
        )}
        {original > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(75,156,70,0.08)', color: '#4B9C46',
            border: '1px solid rgba(75,156,70,0.2)',
          }}>原色精灵 {original}</span>
        )}
        {shiny > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            background: 'rgba(200,131,10,0.10)', color: '#C8830A',
            border: '1px solid rgba(200,131,10,0.25)',
          }}>✨ 异色精灵 {shiny}</span>
        )}
      </div>
    </div>
  );
}

export default function History() {
  const { state } = useStore();
  const tasks = state.completedTasks || [];
  const successTasks = tasks.filter(t => t.resultType !== 'abandoned');
  const totalShiny = successTasks.length;
  const avgBreaks = totalShiny > 0
    ? Math.round(successTasks.reduce((s, t) => s + t.shieldBreakCount, 0) / totalShiny)
    : 0;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 标题 */}
      <div style={{ padding: '20px 16px 10px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>历史记录</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
          共 {tasks.length} 次记录 · {totalShiny} 次出货
        </div>
      </div>

      {/* 汇总统计卡 */}
      {tasks.length > 0 && (
        <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: '成功出货', value: totalShiny, unit: '次', color: '#4B9C46', bg: 'rgba(75,156,70,0.06)' },
              { label: '平均触发污染', value: totalShiny > 0 ? avgBreaks : '—', unit: totalShiny > 0 ? '次' : '', color: '#C8830A', bg: 'rgba(200,131,10,0.06)' },
              { label: '中断次数', value: tasks.length - totalShiny, unit: '次', color: '#A09080', bg: 'transparent' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '14px 10px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--divider)' : 'none',
                background: stat.bg,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                  {stat.value}
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 1 }}>{stat.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">
            暂无刷取记录<br />开始第一次刷取后，记录将显示在这里
          </div>
        </div>
      ) : (
        <>
          <div style={{ margin: '4px 16px 6px', fontSize: 11, color: 'var(--text-light)', fontWeight: 700, letterSpacing: 1 }}>
            ▼ 最近记录
          </div>
          {tasks.map((task, i) => (
            <HistoryCard key={task.id || i} task={task} index={i} />
          ))}
        </>
      )}
    </div>
  );
}
