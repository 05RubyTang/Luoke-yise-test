import { useStore } from '../store';
import { PLANS } from '../data/plans';
import ProgressBar from '../components/ProgressBar';
import PlanIcon from '../components/PlanIcon';
import SpiritAvatar from '../components/SpiritAvatar';

/** 从 completedTasks 中提取最近获得的异色精灵（去重，最多2只） */
function getRecentShinies(state) {
  const seen = new Set();
  const result = [];
  for (const t of state.completedTasks || []) {
    if (t.resultType === 'abandoned' || !t.resultSpirit) continue;
    if (seen.has(t.resultSpirit)) continue;
    seen.add(t.resultSpirit);
    result.push(t);
    if (result.length >= 2) break;
  }
  return result;
}

/** 格式化捕捉时间 */
function formatCaptureTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const M = d.getMonth() + 1;
  const D = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${M}月${D}日 ${h}:${m}`;
}

/** 单只最近精灵卡片 */
function RecentSpiritCard({ task }) {
  const plan = PLANS.find(p => p.id === task.planId);
  const isShiny = task.resultType !== 'offpool';

  return (
    <div style={{
      background: '#F0E8D5',
      borderRadius: 12,
      padding: '10px 10px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      flex: '1 1 0',
      minWidth: 0,
      position: 'relative',
    }}>
      {/* NEW tag */}
      <span style={{
        position: 'absolute', top: 6, right: 6,
        fontSize: 8, fontWeight: 900, letterSpacing: 0.5,
        padding: '2px 5px', borderRadius: 6,
        background: '#E8321A', color: '#fff',
        lineHeight: 1.4,
      }}>NEW</span>

      {/* 精灵头像 */}
      <SpiritAvatar name={task.resultSpirit} obtained size={52} showName={false} />

      {/* 精灵名 */}
      <div style={{
        fontSize: 11, fontWeight: 800, color: '#2B2A2E',
        textAlign: 'center', lineHeight: 1.2,
        width: '100%', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{task.resultSpirit}</div>

      {/* 小标签行 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', alignItems: 'center' }}>
        {/* 异色/奇遇 */}
        <span style={{
          fontSize: 9, fontWeight: 800,
          padding: '2px 7px', borderRadius: 20,
          background: isShiny ? 'rgba(251,200,57,0.25)' : 'rgba(139,75,184,0.12)',
          color: isShiny ? '#C8830A' : '#8B4BB8',
          border: `1px solid ${isShiny ? 'rgba(200,131,10,0.35)' : 'rgba(139,75,184,0.3)'}`,
          letterSpacing: 0.3,
        }}>{isShiny ? '✦ 异色精灵' : '✦ 奇遇精灵'}</span>

        {/* 捕捉时间 */}
        {task.completedAt && (
          <span style={{ fontSize: 9, color: '#9E8E80', fontWeight: 600 }}>
            🕐 {formatCaptureTime(task.completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home({ navigate }) {
  const { state } = useStore();
  const tasks = state.activeTasks || [];
  const recentShinies = getRecentShinies(state);
  const hasRecentShinies = recentShinies.length > 0;

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* 顶部标题图 */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '20px 16px 4px',
      }}>
        <img
          src="/app-title.png"
          alt="小洛克的刷异色助手"
          style={{ height: 44, maxWidth: '85%', objectFit: 'contain' }}
        />
      </div>

      {/* 副标题 */}
      <div style={{
        textAlign: 'center', padding: '4px 0 12px',
        fontSize: 12, color: 'var(--text-light)', letterSpacing: 2, fontWeight: 600,
      }}>
        选方案 · 记触发污染 · 集异色
      </div>

      {/* 新加入的伙伴（有数据才展示） */}
      {hasRecentShinies && (
        <div className="card animate-in" style={{
          margin: '0 16px 12px', padding: '14px 14px 12px',
          background: 'transparent',
          border: 'none',
          backgroundImage: 'url(/home-card-bg.png)',
          backgroundSize: '115%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <div style={{
            fontSize: 20, fontWeight: 800, color: '#2B2A2E',
            marginBottom: 12, letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 18 }}>🌟</span> 最新加入的伙伴
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {recentShinies.map(t => (
              <RecentSpiritCard key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* 进行中任务标题 */}
      {tasks.length > 0 && (
        <div style={{ margin: '4px 16px 6px', fontSize: 11, color: 'var(--text-light)', fontWeight: 700, letterSpacing: 1 }}>
          ▶ 进行中的刷取
        </div>
      )}

      {/* 进行中任务卡片 */}
      {tasks.map((task, idx) => {
        const plan = PLANS.find(p => p.id === task.planId);
        if (!plan) return null;
        const remaining = 80 - task.shieldBreakCount;
        return (
          <div key={task.planId} className="card active-task-card animate-in" style={{ animationDelay: `${idx * 0.06}s` }}>
            <div className="active-task-info">
              {/* 属性图标格 */}
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: '#F0E8D5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden', padding: 4,
              }}>
                <PlanIcon plan={plan} size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="active-task-badge">刷取中</span>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{plan.type}方案</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {plan.fruitA}{plan.fruitB ? ` + ${plan.fruitB}` : ''}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>触发污染保底进度</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--cta)' }}>
                  {task.shieldBreakCount}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>/80</span>
                </span>
              </div>
              <ProgressBar current={task.shieldBreakCount} total={80} color="var(--cta)" />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, textAlign: 'right' }}>
                还差 <span style={{ fontWeight: 700, color: 'var(--text)' }}>{remaining}</span> 次触发保底
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ margin: 0, width: '100%', padding: '13px', fontSize: 14 }}
              onClick={() => navigate('recorder', { planId: task.planId })}
            >
              继续刷取 →
            </button>
          </div>
        );
      })}

      {/* 开始新刷取 */}
      <button
        className="btn btn-primary animate-in"
        onClick={() => navigate('plans')}
      >
        {tasks.length > 0 ? '+ 开始新的刷取' : '✨ 开始刷取异色精灵'}
      </button>

      {tasks.length === 0 && (
        <p style={{
          textAlign: 'center', padding: '6px 24px 0',
          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8,
        }}>
          在眠枭庇护所放好果实后，开始记录触发污染进度
        </p>
      )}
    </div>
  );
}
