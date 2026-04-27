import { useState } from 'react';
import { useStore } from '../store';

export default function CustomChecklist({ navigate, goBack }) {
  const { dispatch } = useStore();

  const [label, setLabel]     = useState('');
  const [fruitA, setFruitA]   = useState('');
  const [fruitB, setFruitB]   = useState('');
  const [shiniesRaw, setShiniesRaw] = useState(''); // 逗号分隔的精灵名
  const [ballInput, setBallInput] = useState('');

  const canStart = fruitA.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;

    const id       = `custom_${Date.now()}`;
    const planLabel = label.trim() || '自定义方案';
    const fa       = fruitA.trim();
    const fb       = fruitB.trim() || null;
    // 从果实名推断精灵名（去掉「果实」后缀），用户可不填精灵
    const sa       = fa.endsWith('果实') ? fa.slice(0, -2) : fa;
    const sb       = fb ? (fb.endsWith('果实') ? fb.slice(0, -2) : fb) : null;
    // 解析可出精灵列表
    const shinies  = shiniesRaw.trim()
      ? shiniesRaw.split(/[，,、\s]+/).map(s => s.trim()).filter(Boolean)
      : (sa ? [sa] : []);

    const plan = {
      id,
      attrId: 'custom',
      label: planLabel,
      type:  planLabel,
      fruitA: fa,
      fruitB: fb,
      spiritA: sa,
      spiritB: sb,
      shinies,
      season: false,
      custom: true,
    };

    dispatch({ type: 'SAVE_USER_PLAN', plan });

    const ballStart = ballInput.trim() ? parseInt(ballInput.trim(), 10) : null;
    dispatch({
      type: 'START_TASK',
      planId: id,
      ballStart: (ballStart && !isNaN(ballStart)) ? ballStart : null,
    });

    navigate('recorder', { planId: id });
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* 顶部 */}
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <span className="page-header-title">自定义刷取方案</span>
      </div>

      {/* 说明条 */}
      <div className="card" style={{ background: '#FFF9E0', border: '1.5px solid #C8A020', boxShadow: '0 2px 0 #C8A020', padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.8 }}>
          填写你手头的果实，自定义刷取方案，灵活记录任意组合。
        </div>
      </div>

      {/* 方案名称 */}
      <div className="card animate-in">
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>方案名称 <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>（选填）</span></div>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="例：幽系自定义 / 混合方案"
          className="input-field"
        />
      </div>

      {/* 果实 */}
      <div className="card animate-in" style={{ animationDelay: '0.04s' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>果实配置</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 0.4 }}>
            果实 A <span style={{ color: 'var(--cta)', fontWeight: 900 }}>*</span>（必填）
          </div>
          <input
            type="text"
            value={fruitA}
            onChange={e => setFruitA(e.target.value)}
            placeholder="例：小灵面果实"
            className="input-field"
            style={{ borderColor: fruitA.trim() ? 'var(--divider)' : 'rgba(200,131,10,0.4)' }}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 0.4 }}>
            果实 B（选填）
          </div>
          <input
            type="text"
            value={fruitB}
            onChange={e => setFruitB(e.target.value)}
            placeholder="例：墨鱿士果实（留空则单果实循环）"
            className="input-field"
          />
        </div>
      </div>

      {/* 可出精灵 */}
      <div className="card animate-in" style={{ animationDelay: '0.07s' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
          可出异色精灵 <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>（选填）</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
          用逗号分隔多个精灵名，留空则自动填入果实A对应精灵
        </div>
        <input
          type="text"
          value={shiniesRaw}
          onChange={e => setShiniesRaw(e.target.value)}
          placeholder="例：空空颅, 小灵面"
          className="input-field"
        />
      </div>

      {/* 精灵球 */}
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

      {/* 开始按钮 */}
      <button
        className={`btn animate-in${canStart ? ' btn-primary' : ''}`}
        style={{
          animationDelay: '0.12s',
          opacity: canStart ? 1 : 0.45,
          cursor: canStart ? 'pointer' : 'not-allowed',
          background: canStart ? undefined : '#B0A898',
          boxShadow: canStart ? undefined : 'none',
        }}
        onClick={handleStart}
        disabled={!canStart}
      >
        开始刷取
      </button>
    </div>
  );
}
