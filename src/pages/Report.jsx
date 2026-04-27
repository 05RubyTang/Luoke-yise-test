import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';

function getStarRating(breakCount) {
  if (breakCount <= 10) return { stars: 5, label: '超级欧皇', color: '#C8830A' };
  if (breakCount <= 20) return { stars: 4, label: '欧皇',     color: '#C8830A' };
  if (breakCount <= 40) return { stars: 3, label: '正常发挥', color: '#4B9C46' };
  if (breakCount <= 60) return { stars: 2, label: '有点非',   color: '#8B4BB8' };
  if (breakCount <= 79) return { stars: 1, label: '非酋',     color: '#D4560A' };
  return { stars: 0, label: '极限保底', color: '#C8351A' };
}

// 星级渲染
function Stars({ count, color }) {
  return (
    <span style={{ color, fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

// 数据行
function Row({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: '1px solid rgba(103,93,83,0.1)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
        {children}
      </span>
    </div>
  );
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

  const handleSave = () => {
    dispatch({ type: 'COMPLETE_TASK', planId, spiritName, isPool, ballEnd: (ballEnd && !isNaN(ballEnd)) ? ballEnd : null });
    navigate('home');
  };
  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_AND_CONTINUE', planId, spiritName, isPool, ballEnd: (ballEnd && !isNaN(ballEnd)) ? ballEnd : null });
    navigate('recorder', { planId });
  };

  return (
    /* 全屏遮罩（absolute 限制在 .mockup-screen / .app-content 容器内，不溢出样机） */
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(43,42,46,0.55)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-end',
    }}>
      {/* 弹窗主体 */}
      <div style={{
        width: '100%', maxWidth: 500,
        background: '#FBF7EC',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(43,42,46,0.18)',
        overflow: 'hidden',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* ── 顶部标题栏 ── */}
        <div style={{
          background: '#2B2A2E',
          padding: '16px 20px 14px',
          textAlign: 'center',
          position: 'relative',
          flexShrink: 0,
        }}>
          {/* 星星装饰 */}
          <div style={{
            fontSize: 11, color: 'rgba(251,200,57,0.7)',
            letterSpacing: 8, marginBottom: 4,
          }}>✦ ✦ ✦</div>
          <div style={{
            fontSize: 18, fontWeight: 900, color: '#FBC839',
            fontFamily: 'var(--font-display)', letterSpacing: 1,
          }}>恭喜获得异色精灵</div>
          <div style={{
            fontSize: 11, color: 'rgba(251,200,57,0.7)',
            letterSpacing: 8, marginTop: 4,
          }}>✦ ✦ ✦</div>
        </div>

        {/* ── 可滚动内容区 ── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* 精灵 + 数据 横排卡 */}
          <div style={{
            margin: '16px 16px 0',
            background: '#F0E8D5',
            borderRadius: 14,
            border: '1.5px solid rgba(103,93,83,0.2)',
            overflow: 'hidden',
            display: 'flex',
          }}>
            {/* 左：精灵图 */}
            <div style={{
              width: 120, flexShrink: 0,
              background: '#E8DCC8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 12, position: 'relative',
            }}>
              <img
                src={`${import.meta.env.BASE_URL}spirits/${encodeURIComponent(spiritName)}.png`}
                alt={spiritName}
                style={{ width: 96, height: 96, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              {/* 异色光效角标 */}
              <div style={{
                position: 'absolute', top: 6, right: 6,
                fontSize: 16, lineHeight: 1,
                filter: 'drop-shadow(0 0 4px rgba(251,200,57,0.9))',
              }}>✨</div>
              {/* 精灵名 */}
              <div style={{
                position: 'absolute', bottom: 8, left: 0, right: 0,
                textAlign: 'center',
                fontSize: 11, fontWeight: 900, color: '#2B2A2E',
                fontFamily: 'var(--font-display)',
              }}>{spiritName}</div>
            </div>

            {/* 右：数据表 */}
            <div style={{ flex: 1, padding: '4px 14px 4px 10px' }}>
              {/* 方案内/歪池 tag */}
              <div style={{ paddingTop: 10, marginBottom: 2 }}>
                {isPool ? (
                  <span style={{
                    fontSize: 10, color: '#C8830A', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 20,
                    background: '#FFF3CC', border: '1px solid #C8A020',
                  }}>✓ 方案内精灵</span>
                ) : (
                  <span style={{
                    fontSize: 10, color: 'var(--polluted)', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 20,
                    background: '#F5E8FF', border: '1px solid rgba(139,75,184,0.3)',
                  }}>🎲 歪池意外收获</span>
                )}
              </div>

              <Row label="果实方案">
                <PlanIcon plan={plan} size={14} />
                {plan.type}
              </Row>

              <Row label="触发污染次数">
                <span style={{ color: 'var(--cta)', fontWeight: 900, fontSize: 16, fontFamily: 'var(--font-display)' }}>
                  {task.shieldBreakCount}
                </span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>/80</span>
              </Row>

              <Row label="触发污染分布">
                <span style={{ color: 'var(--success)', fontSize: 11 }}>绿×{breakdowns.original}</span>
                <span style={{ color: 'var(--polluted)', fontSize: 11 }}>紫×{breakdowns.polluted}</span>
                <span style={{ color: 'var(--gold)', fontSize: 11 }}>✨×{breakdowns.shiny}</span>
              </Row>

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>欧非指数</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Stars count={rating.stars} color={rating.color} />
                  <span style={{ fontSize: 11, color: rating.color, fontWeight: 800 }}>{rating.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── 精灵球消耗 ── */}
          <div style={{ margin: '16px 16px 0' }}>
            {/* 分割线标题 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(103,93,83,0.15)' }} />
              <span style={{
                fontSize: 12, fontWeight: 800, color: 'var(--text-light)',
                padding: '3px 12px', borderRadius: 20,
                background: '#F0E8D5', border: '1px solid rgba(103,93,83,0.2)',
              }}>精灵球消耗</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(103,93,83,0.15)' }} />
            </div>

            <div style={{
              background: '#F0E8D5', borderRadius: 12,
              padding: '12px 14px',
              border: '1px solid rgba(103,93,83,0.15)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>精灵球消耗</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
                {hasBallStart
                  ? `开始时 ${task.ballStart} 个，输入当前剩余数量`
                  : '输入当前精灵球剩余数量（选填）'}
              </div>
              <input
                type="number" inputMode="numeric"
                value={ballInput} onChange={e => setBallInput(e.target.value)}
                placeholder="输入当前精灵球数量"
                className="input-field"
                style={{ background: '#FBF7EC' }}
              />
              {ballsUsed != null && ballsUsed >= 0 && (
                <div style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  background: '#FFF9E0', border: '1px solid #C8A020',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>本次消耗</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--cta)' }}>{ballsUsed} 个精灵球</span>
                </div>
              )}
            </div>
          </div>

          {/* ── 底部按钮区 ── */}
          <div style={{ padding: '12px 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-gold"
              onClick={handleSave}
              style={{ width: '100%', margin: 0 }}
            >
              📖 保存并结束
            </button>
            <button
              onClick={handleContinue}
              style={{
                width: '100%', padding: '12px',
                borderRadius: 12, border: '1.5px solid rgba(103,93,83,0.3)',
                background: 'transparent',
                fontSize: 13, fontWeight: 700, color: 'var(--text-light)',
                fontFamily: 'var(--font-body)', cursor: 'pointer',
              }}
            >
              继续刷取（保留方案）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
