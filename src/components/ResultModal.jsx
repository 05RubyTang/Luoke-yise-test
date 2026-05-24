import { createPortal } from 'react-dom';

const getModalRoot = () => document.getElementById('modal-root') || document.body;
const base = import.meta.env.BASE_URL;

export default function ResultModal({ onResult, onClose, hasTabBar = true }) {
  return createPortal(
    <div className={`modal-overlay${hasTabBar ? '' : ' modal-overlay--no-tab'}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* 顶部标题行：左上角取消 + 标题 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          marginBottom: 16, gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              background: 'var(--card-inner)',
              border: '1.5px solid var(--divider)',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12, fontWeight: 700,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            取消
          </button>
          <div className="modal-title" style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            这次的奇遇事件？
          </div>
          {/* 右侧占位，让标题居中 */}
          <div style={{ flexShrink: 0, width: 44 }} />
        </div>

        {/* 选项网格：一行 2 个 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

          <button className="modal-option modal-option--grid" onClick={() => onResult('original')}>
            <img src={`${base}icon-original.webp`} alt="原色精灵" className="modal-option-icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>原色精灵</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>精灵恢复正常形态</div>
            </div>
          </button>

          <button className="modal-option modal-option--grid" onClick={() => onResult('polluted')}>
            <img src={`${base}icon-polluted.webp`} alt="污染血脉" className="modal-option-icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>污染血脉</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>带有紫色污染血脉</div>
            </div>
          </button>

          <button className="modal-option modal-option--grid" onClick={() => onResult('shiny_blood')}>
            <img src={`${base}icon-shiny-blood.webp`} alt="奇异血脉" className="modal-option-icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>奇异血脉</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>出现奇异形态血脉</div>
            </div>
          </button>

          <button className="modal-option modal-option--grid" onClick={() => onResult('mixed_blood')}>
            <img src={`${base}icon-mixed-blood.webp`} alt="混血血脉" className="modal-option-icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>混血血脉</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>出现混合血脉形态</div>
            </div>
          </button>

          <button
            className="modal-option modal-option--grid"
            onClick={() => onResult('shiny')}
            style={{ borderColor: '#C8A020', background: '#FFF9E0', boxShadow: '0 2px 0 #C8A020' }}
          >
            <img src={`${base}icon-shiny.webp`} alt="异色精灵" className="modal-option-icon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#C8830A' }}>异色精灵！</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>稀有配色精灵出现</div>
            </div>
          </button>

          <button className="modal-option modal-option--grid" onClick={() => onResult('jelly')}>
            <span className="modal-option-icon">🍮</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>果冻 / 星辰虫</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>仅计世界池，不计保底</div>
            </div>
          </button>

        </div>

        {/* 触发失败：独占一行（窄版） */}
        <button
          className="modal-option"
          onClick={() => onResult('failed')}
          style={{ marginTop: 8 }}
        >
          <span className="modal-option-icon">❌</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>触发失败</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>逃跑 / 战败，本次完全不计入</div>
          </div>
        </button>

      </div>
    </div>,
    getModalRoot()
  );
}
