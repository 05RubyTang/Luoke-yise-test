export default function ResultModal({ onResult, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">这次触发污染结果？</div>

        <button className="modal-option" onClick={() => onResult('original')}>
          <span className="modal-option-icon">🟢</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>原色精灵</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>精灵恢复正常形态</div>
          </div>
        </button>

        <button className="modal-option" onClick={() => onResult('polluted')}>
          <span className="modal-option-icon">🟣</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>污染精灵</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>带有紫色污染血脉</div>
          </div>
        </button>

        <button
          className="modal-option"
          onClick={() => onResult('shiny')}
          style={{ borderColor: '#C8A020', background: '#FFF9E0', boxShadow: '0 2px 0 #C8A020' }}
        >
          <span className="modal-option-icon">✨</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#C8830A' }}>异色精灵！</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>稀有配色精灵出现</div>
          </div>
        </button>

        <button className="modal-option" onClick={() => onResult('failed')}>
          <span className="modal-option-icon">❌</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>触发污染失败</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>逃跑/战败，本次不计入</div>
          </div>
        </button>

        <button className="modal-close" onClick={onClose}>取消</button>
      </div>
    </div>
  );
}
