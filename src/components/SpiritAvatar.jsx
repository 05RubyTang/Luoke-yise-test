const base = import.meta.env.BASE_URL;
export default function SpiritAvatar({ name, obtained, size = 48, showName = true, bare = false }) {
  const src = `${base}spirits/${encodeURIComponent(name)}.png`;

  // bare 模式：只输出 img，不带任何外层 div（用于图鉴网格等自定义布局）
  if (bare) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size,
          objectFit: 'contain',
          opacity: obtained ? 1 : 0.45,
          display: 'block',
        }}
        onError={e => { e.target.style.opacity = '0'; }}
      />
    );
  }

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
            e.target.style.display = 'none';
            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
          }}
        />
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
