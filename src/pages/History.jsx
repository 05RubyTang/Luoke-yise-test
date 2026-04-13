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

/** 解析 input 字符串为非负整数，无效则返回 null */
function parseNonNeg(str) {
  const n = parseInt(str.trim(), 10);
  return (str.trim() !== '' && !isNaN(n) && n >= 0) ? n : null;
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

  // ---- 编辑态 ----
  const [editing, setEditing] = useState(false);
  const [inputs, setInputs] = useState({
    shieldBreakCount: '',
    polluted: '',
    original: '',
    ballsUsed: '',
  });

  const openEdit = () => {
    setInputs({
      shieldBreakCount: task.shieldBreakCount != null ? String(task.shieldBreakCount) : '',
      polluted: String(polluted),
      original: String(original),
      ballsUsed: task.ballsUsed != null ? String(task.ballsUsed) : '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    const sbc = parseNonNeg(inputs.shieldBreakCount);
    const pol = parseNonNeg(inputs.polluted);
    const ori = parseNonNeg(inputs.original);
    const bal = parseNonNeg(inputs.ballsUsed);
    dispatch({
      type: 'UPDATE_COMPLETED_STATS',
      taskId: task.id,
      shieldBreakCount: sbc ?? task.shieldBreakCount,
      polluted: pol ?? polluted,
      original: ori ?? original,
      ballsUsed: bal,
    });
    setEditing(false);
  };

  const setField = (field, val) => setInputs(prev => ({ ...prev, [field]: val }));

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

        {/* 编辑按钮 */}
        <button
          onClick={editing ? () => setEditing(false) : openEdit}
          style={{
            flexShrink: 0,
            border: editing ? '1px solid rgba(103,93,83,0.3)' : '1px solid rgba(103,93,83,0.25)',
            background: editing ? '#F0E8D5' : 'var(--card-inner)',
            borderRadius: 6,
            padding: '4px 10px', fontSize: 10, fontWeight: 700,
            color: editing ? 'var(--text-muted)' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >{editing ? '✕ 取消' : '✎ 编辑'}</button>
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
          { label: '消耗球数', value: task.ballsUsed != null ? task.ballsUsed : '—', color: '#2B2A2E' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '10px 4px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(103,93,83,0.12)' : 'none',
          }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: item.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {item.value}
            </div>
            <div style={{ fontSize: 9, color: '#A09080', marginTop: 4, fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ---- 编辑面板 ---- */}
      {editing && (
        <div style={{
          background: '#F0E8D5', borderRadius: 10,
          padding: '12px 12px 10px', marginBottom: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5 }}>
            修改数据
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', marginBottom: 10 }}>
            {[
              { field: 'shieldBreakCount', label: '触发污染次数', placeholder: '次数', color: '#D4560A' },
              { field: 'polluted',         label: '污染精灵',     placeholder: '只',  color: '#8B4BB8' },
              { field: 'original',         label: '原色精灵',     placeholder: '只',  color: '#4B9C46' },
              { field: 'ballsUsed',        label: '消耗球数',     placeholder: '个',  color: '#2B2A2E' },
            ].map(({ field, label, placeholder, color }) => (
              <div key={field}>
                <div style={{ fontSize: 9, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
                <input
                  type="number" inputMode="numeric" min="0"
                  value={inputs[field]}
                  onChange={e => setField(field, e.target.value)}
                  placeholder={placeholder}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '7px 10px', borderRadius: 7,
                    border: `1.5px solid ${color}44`,
                    background: '#FBF7EC',
                    fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-display)',
                    color: color, outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} style={{
            width: '100%',
            padding: '10px 0',
            border: '2px solid #2B2A2E', borderRadius: 'var(--radius-sm)',
            background: '#2B2A2E', color: '#FBF7EC',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 2px 0 #111014',
          }}>保存修改</button>
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
