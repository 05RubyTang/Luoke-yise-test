import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';

function getStarRating(breakCount) {
  if (breakCount <= 10) return { stars: '★★★★★', label: '超级欧皇', color: '#C8830A' };
  if (breakCount <= 20) return { stars: '★★★★☆', label: '欧皇',     color: '#C8830A' };
  if (breakCount <= 40) return { stars: '★★★☆☆', label: '正常发挥', color: '#4B9C46' };
  if (breakCount <= 60) return { stars: '★★☆☆☆', label: '有点非',   color: '#8B4BB8' };
  if (breakCount <= 79) return { stars: '★☆☆☆☆', label: '非酋',     color: '#D4560A' };
  return { stars: '☆☆☆☆☆', label: '极限保底', color: '#C8351A' };
}

export default function Report({ planId, spiritName, isPool, navigate }) {
  const { state, dispatch } = useStore();
  const plan = PLANS.find(p => p.id === planId);
  const task = (state.activeTasks || []).find(t => t.planId === planId);
  const [ballInput, setBallInput] = useState('');

  if (!plan || !task) return null;

  const breakdowns = { original: 0, polluted: 0, shiny: 0 };
  task.shieldBreaks.forEach(b => { breakdowns[b.result]++; });
  const rating = getStarRating(task.shieldBreakCount);
  const hasBallStart = task.ballStart != null;

  const ballEnd = ballInput.trim() ? parseInt(ballInput.trim(), 10) : null;
  const ballsUsed = (hasBallStart && ballEnd != null && !isNaN(ballEnd)) ? task.ballStart - ballEnd : null;

  const remaining = plan.shinies.filter(s => {
    if (s === spiritName) return false;
    return !state.spirits[s]?.obtained;
  });

  const handleSave = () => {
    dispatch({ type: 'COMPLETE_TASK', planId, spiritName, isPool, ballEnd: (ballEnd && !isNaN(ballEnd)) ? ballEnd : null });
    navigate('home');
  };
  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_AND_CONTINUE', planId, spiritName, isPool, ballEnd: (ballEnd && !isNaN(ballEnd)) ? ballEnd : null });
    navigate('recorder', { planId });
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 庆祝头部 */}
      <div className="report-header">
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 10 }}>🎉</div>
        <div style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 600, letterSpacing: 1 }}>
          恭喜获得异色精灵
        </div>
        <div className="report-spirit-name">{spiritName}</div>

        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {isPool ? (
            <span style={{
              fontSize: 11, color: '#C8830A', fontWeight: 700,
              padding: '3px 12px', borderRadius: 20,
              background: '#FFF3CC', border: '1.5px solid #C8A020',
            }}>✓ 方案内精灵</span>
          ) : (
            <span style={{
              fontSize: 11, color: 'var(--polluted)', fontWeight: 700,
              padding: '3px 12px', borderRadius: 20,
              background: '#F5E8FF', border: '1.5px solid rgba(139,75,184,0.3)',
            }}>🎲 歪池意外收获！</span>
          )}
        </div>
      </div>

      {/* 数据卡 */}
      <div className="card animate-in">
        <div className="report-data">
          <div className="report-row">
            <span className="report-label">果实方案</span>
            <span className="report-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlanIcon plan={plan} size={18} />
              {plan.type}
            </span>
          </div>
          <div className="report-row">
            <span className="report-label">触发污染次数</span>
            <span className="report-value">
              <span style={{ color: 'var(--cta)', fontWeight: 900, fontSize: 18 }}>{task.shieldBreakCount}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}> / 80</span>
            </span>
          </div>
          <div className="report-row">
            <span className="report-label">触发污染分布</span>
            <span className="report-value" style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--success)' }}>绿×{breakdowns.original}</span>
              <span style={{ color: 'var(--polluted)' }}>紫×{breakdowns.polluted}</span>
              <span style={{ color: 'var(--gold)' }}>✨×{breakdowns.shiny}</span>
            </span>
          </div>
          <div className="report-row">
            <span className="report-label">欧非指数</span>
            <span className="report-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="star-rating" style={{ color: rating.color }}>{rating.stars}</span>
              <span style={{ fontSize: 12, color: rating.color, fontWeight: 800 }}>{rating.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 精灵球消耗 */}
      {hasBallStart && (
        <div className="card animate-in" style={{ animationDelay: '0.06s' }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>精灵球消耗</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
            开始时 {task.ballStart} 个，输入当前剩余数量
          </div>
          <input
            type="number" inputMode="numeric"
            value={ballInput} onChange={e => setBallInput(e.target.value)}
            placeholder="输入当前精灵球数量"
            className="input-field"
          />
          {ballsUsed != null && ballsUsed >= 0 && (
            <div style={{
              marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 10,
              background: '#FFF9E0', border: '1.5px solid #C8A020',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>本次消耗</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--cta)' }}>{ballsUsed} 个精灵球</span>
            </div>
          )}
        </div>
      )}

      {/* 剩余未获得 */}
      {remaining.length > 0 && (
        <div className="card animate-in" style={{ animationDelay: '0.10s' }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
            该方案还差 <span style={{ color: 'var(--cta)' }}>{remaining.length}</span> 只未获得
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {remaining.map(name => <SpiritAvatar key={name} name={name} size={40} />)}
          </div>
        </div>
      )}

      <button className="btn btn-primary animate-in" style={{ animationDelay: '0.13s' }} onClick={handleContinue}>
        继续刷取（保留方案）
      </button>
      <button className="btn btn-outline animate-in" style={{ animationDelay: '0.17s' }} onClick={handleSave}>
        保存并结束
      </button>
    </div>
  );
}
