const base = import.meta.env.BASE_URL;
const TABS = [
  { id: 'home',       img: `${base}tab-home.png`,       label: '首页' },
  { id: 'plans',      img: `${base}tab-plans.png`,      label: '方案' },
  { id: 'collection', img: `${base}tab-collection.png`, label: '图鉴' },
  { id: 'history',    img: `${base}tab-history.png`,    label: '记录' },
];

export default function TabBar({ current, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tabbar-item${current === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <img
            src={tab.img}
            alt={tab.label}
            className="tabbar-img"
          />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
