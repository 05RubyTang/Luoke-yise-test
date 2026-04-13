const base = import.meta.env.BASE_URL;
export default function SpiritAvatar({ name, obtained, size = 48, showName = true }) {
  const src = `${base}spirits/${encodeURIComponent(name)}.png`;
  return (
    <div
      className={`spirit-card${obtained ? ' spirit-card-obtained' : ''}`}
      style={{ width: size + 18 }}
    >
      <div className="spirit-card-img" style={{ width: size, height: size }}>
        <img
          src={src}
          alt={name}
          style={{ opacity: obtained ? 1 : 0.5 }}
          onError={e => {
            // 图片加载失败时显示占位符
            e.target.style.display = 'none';
            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
          }}
        />
        {/* 获得标记 */}
        {obtained && (
          <span className="spirit-card-check">✓</span>
        )}
      </div>
      {showName && (
        <span className="spirit-card-name" title={name}>{name}</span>
      )}
    </div>
  );
}
