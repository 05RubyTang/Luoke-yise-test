import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';
import FruitTag, { FruitLine } from '../components/FruitTag';

const base = import.meta.env.BASE_URL;

const TIPS = [
  '在眠枭庇护所放好对应果实',
  '庇护所内不要放其他多余果实',
  '刷取期间不要跨区传送或退出游戏',
];

export default function Checklist({ planId, navigate, goBack }) {
  const { state, dispatch } = useStore();
  const plan = PLANS.find(p => p.id === planId)
    || (state.userPlanConfig || []).find(p => p.id === planId);
  const [ballInput, setBallInput] = useState('');

  if (!plan) return null;

  const handleStart = () => {
    const ballStart = ballInput.trim() ? parseInt(ballInput.trim(), 10) : null;
    dispatch({
      type: 'START_TASK',
      planId: plan.id,
      ballStart: (ballStart && !isNaN(ballStart)) ? ballStart : null,
    });
    navigate('recorder', { planId: plan.id });
  };

  // 赛季单抓：目标精灵（shinies[0]）
  const targetSpirit = plan.season ? plan.shinies[0] : null;
  const spiritImgSrc = targetSpirit
    ? `${base}spirits/${encodeURIComponent(targetSpirit)}.png`
    : null;
  const isObtained = targetSpirit ? !!state.spirits[targetSpirit]?.obtained : false;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="page-header-title">确认方案</span>
      </div>

      {/* ── 方案概览卡 ── */}
      <div className="card animate-in">

        {/* 顶部：图标 + 标题行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {plan.season ? (
            /* 赛季单抓：用精灵大图替换属性 icon */
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: isObtained ? 'rgba(75,156,70,0.1)' : '#F0E8D5',
              border: isObtained ? '2px solid rgba(75,156,70,0.35)' : '2px solid rgba(103,93,83,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              <img
                src={spiritImgSrc}
                alt={targetSpirit}
                style={{ width: 56, height: 56, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              {isObtained && (
                <span style={{
                  position: 'absolute', bottom: 2, right: 4,
                  fontSize: 12, color: '#4B9C46', fontWeight: 900,
                }}>✓</span>
              )}
            </div>
          ) : (
            /* 属性方案：保持原属性 icon */
            <div style={{
              width: 52, height: 52, borderRadius: 13,
              background: '#F0E8D5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden', padding: 6,
            }}>
              <PlanIcon plan={plan} size={36} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)' }}>
              {plan.season ? `${plan.type} 异色刷取` : `${plan.type}方案`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              <FruitLine fruitA={plan.fruitA} fruitB={plan.fruitB} size={15} />
            </div>
            {plan.season && isObtained && (
              <div style={{
                marginTop: 4, display: 'inline-block',
                fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 10,
                background: 'rgba(75,156,70,0.12)', color: '#4B9C46',
                border: '1px solid rgba(75,156,70,0.3)',
              }}>✓ 已收录</div>
            )}
          </div>
        </div>

        {/* 属性方案：刷取循环 */}
        {!plan.season && (
          <div style={{
            background: 'var(--card-inner)',
            borderRadius: 10, padding: '10px 12px', marginBottom: 14,
            fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8,
          }}>
            <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 11, letterSpacing: 0.5 }}>
              刷取循环
            </span>
            <br />
            抓3只{plan.spiritA}
            {plan.spiritB ? ` → 抓3只${plan.spiritB} → 循环` : ' → 每3只一轮，反复循环'}
          </div>
        )}

        {/* 赛季方案：庇护所 + 同放果实 + 解锁条件，合并在一张卡内 */}
        {plan.season && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>

            {/* 解锁条件 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: 'var(--card-inner)',
            }}>
              <FruitTag name={plan.fruitA} size={38} showName={false} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{plan.fruitA}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{plan.unlockA}</div>
              </div>
            </div>

            {/* 推荐庇护所 */}
            {plan.sanctuary && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--card-inner)',
              }}>
                <span style={{
                  fontSize: 10, color: '#5B9CF6', fontWeight: 800,
                  minWidth: 28, paddingTop: 1, flexShrink: 0,
                }}>📍 庇</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>「{plan.sanctuary}」</div>
                  {plan.sanctuaryTip && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{plan.sanctuaryTip}</div>
                  )}
                </div>
              </div>
            )}

            {/* 推荐同放果实 */}
            {plan.coFruit && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: '#FFF9E0',
                border: '1px solid rgba(200,160,32,0.3)',
              }}>
                <span style={{ fontSize: 10, color: '#C8830A', fontWeight: 800, minWidth: 28, flexShrink: 0 }}>
                  同放
                </span>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 800 }}>{plan.coFruit}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>可与本果实共用同一庇护所，节省位置</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 属性方案：可产出精灵列表 */}
        {!plan.season && (
          <>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>
              可产出异色精灵
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {plan.shinies.map(name => (
                <SpiritAvatar key={name} name={name} obtained={state.spirits[name]?.obtained} size={40} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 属性方案：解锁条件（单独卡片） */}
      {!plan.season && (
        <div className="card animate-in" style={{ animationDelay: '0.05s' }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>解锁条件</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: plan.fruitA, desc: plan.unlockA },
              plan.fruitB ? { label: plan.fruitB, desc: plan.unlockB } : null,
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--card-inner)',
              }}>
                <FruitTag name={item.label} size={40} showName={false} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 精灵球库存 */}
      <div className="card animate-in" style={{ animationDelay: '0.09s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>精灵球库存</span>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20,
            background: 'var(--card-inner)', color: 'var(--text-muted)',
            border: '1px solid var(--divider)', fontWeight: 600,
          }}>选填</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
          填写后，出货时可自动计算本次消耗球数
        </div>
        <input
          type="number" inputMode="numeric"
          value={ballInput} onChange={e => setBallInput(e.target.value)}
          placeholder="输入当前精灵球数量"
          className="input-field"
        />
      </div>

      {/* 开始前确认 */}
      <div className="card animate-in" style={{
        animationDelay: '0.13s',
        background: '#FFF9E0', borderColor: '#C8A020', boxShadow: '0 2px 0 #C8A020',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, color: '#C8830A' }}>
          ⚡ 开始前确认
        </div>
        {TIPS.map((text, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '7px 0',
            borderBottom: i < TIPS.length - 1 ? '1px solid rgba(200,160,32,0.2)' : 'none',
            fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5,
          }}>
            <span style={{ color: '#C8830A', fontWeight: 800, flexShrink: 0 }}>·</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary animate-in" style={{ animationDelay: '0.17s' }} onClick={handleStart}>
        开始刷取
      </button>
    </div>
  );
}
