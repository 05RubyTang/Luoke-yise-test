import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { SEASON_LIST } from '../data/seasons';

const base = import.meta.env.BASE_URL;

// 各赛季颜色配置
const SEASON_STYLE = {
  S3: { bg: 'linear-gradient(135deg, #7B1FA2 0%, #6A0F8E 100%)', color: '#fff', dotBg: 'rgba(123,31,162,0.12)', dotBorder: 'rgba(123,31,162,0.35)', dotColor: '#7B1FA2' },
  S2: { bg: 'linear-gradient(135deg, #8B7355 0%, #675D53 100%)', color: '#fff', dotBg: 'rgba(139,115,85,0.12)', dotBorder: 'rgba(139,115,85,0.4)', dotColor: '#8B7355' },
  S1: { bg: 'linear-gradient(135deg, #8B7355 0%, #675D53 100%)', color: '#fff', dotBg: 'rgba(139,115,85,0.12)', dotBorder: 'rgba(139,115,85,0.4)', dotColor: '#8B7355' },
};

/**
 * 赛季切换器组件
 * 只展示当前赛季 tag，右边「切换 ▾」点击后下拉选择
 */
export default function SeasonSwitcher({ style }) {
  const { state, dispatch } = useStore();
  const currentSeason = state.currentSeason || 'S3';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const currentData = SEASON_LIST.find(s => s.id === currentSeason) || SEASON_LIST[0];
  const st = SEASON_STYLE[currentSeason] || SEASON_STYLE.S1;

  // 点击外部关闭下拉
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const handleSwitch = (seasonId) => {
    setOpen(false);
    if (seasonId === currentSeason) return;
    dispatch({ type: 'SWITCH_SEASON', season: seasonId });
  };

  return (
    <div
      ref={wrapRef}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        position: 'relative',
        ...style,
      }}
    >
      {/* 当前赛季 tag */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 8,
        background: st.bg,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        <img
          src={
            currentSeason === 'S1' ? `${base}s1-icon.png`
            : currentSeason === 'S2' ? `${base}s2-icon.png`
            : `${base}s3-icon.png`
          }
          alt={currentSeason}
          style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: st.color, whiteSpace: 'nowrap' }}>
          {currentData.label}
        </span>
      </div>

      {/* 切换按钮 */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '5px 8px',
          borderRadius: 8,
          border: `1px solid ${st.dotBorder}`,
          background: st.dotBg,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: st.dotColor }}>切换</span>
        <span style={{
          fontSize: 9,
          color: st.dotColor,
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s',
          lineHeight: 1,
        }}>▾</span>
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 160,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1.5px solid rgba(103,93,83,0.12)',
          overflow: 'hidden',
          zIndex: 200,
        }}>
          {SEASON_LIST.map((season, i) => {
            const isActive = season.id === currentSeason;
            const ss = SEASON_STYLE[season.id] || SEASON_STYLE.S1;
            return (
              <button
                key={season.id}
                onClick={() => handleSwitch(season.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 14px',
                  background: isActive ? ss.dotBg : 'transparent',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid rgba(103,93,83,0.08)' : 'none',
                  cursor: isActive ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <img
                  src={
                    season.id === 'S1' ? `${base}s1-icon.png`
                    : season.id === 'S2' ? `${base}s2-icon.png`
                    : `${base}s3-icon.png`
                  }
                  alt={season.id}
                  style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: isActive ? 800 : 600,
                    color: isActive ? ss.dotColor : '#2B2A2E',
                  }}>
                    {season.label}
                  </div>
                  {season.isHistorical && (
                    <div style={{ fontSize: 9, color: '#A09080', fontWeight: 500, marginTop: 1 }}>历史赛季</div>
                  )}
                </div>
                {isActive && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    color: ss.dotColor,
                    flexShrink: 0,
                  }}>当前 ✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
