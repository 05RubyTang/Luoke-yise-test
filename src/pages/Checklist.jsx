import { useState } from 'react';
import { useStore } from '../store';
import { PLANS } from '../data/plans';
import SpiritAvatar from '../components/SpiritAvatar';
import PlanIcon from '../components/PlanIcon';

const TIPS = [
  '在眠枭庇护所放好对应果实',
  '庇护所内不要放其他多余果实',
  '刷取期间不要跨区传送或退出游戏',
];

export default function Checklist({ planId, navigate, goBack }) {
  const { state, dispatch } = useStore();
  const plan = PLANS.find(p => p.id === planId);
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

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="page-header-title">确认方案</span>
      </div>

      {/* 方案概览卡 */}
      <div className="card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {/* 大属性图标 */}
          <div style={{
            width: 52, height: 52, borderRadius: 13,
            background: '#F0E8D5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden', padding: 6,
          }}>
            <PlanIcon plan={plan} size={36} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)' }}>{plan.type}方案</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {plan.fruitA}{plan.fruitB ? ` + ${plan.fruitB}` : '（单放）'}
            </div>
          </div>
        </div>

        {/* 刷取循环说明 */}
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

        {/* 可产出精灵 */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, letterSpacing: 0.5 }}>
          可产出异色精灵
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {plan.shinies.map(name => (
            <SpiritAvatar key={name} name={name} obtained={state.spirits[name]?.obtained} size={40} />
          ))}
        </div>
      </div>

      {/* 解锁条件 */}
      <div className="card animate-in" style={{ animationDelay: '0.05s' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>解锁条件</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: plan.fruitA, desc: plan.unlockA },
            plan.fruitB ? { label: plan.fruitB, desc: plan.unlockB } : null,
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              background: 'var(--card-inner)',
            }}>
              <span style={{ fontSize: 10, color: '#C8830A', fontWeight: 800, minWidth: 26, paddingTop: 1 }}>
                果实
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
