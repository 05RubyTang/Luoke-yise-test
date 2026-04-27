import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { ALL_SHINIES } from './data/plans';
import { supabase } from './supabase';

const STORAGE_KEY = 'roco-shiny-helper';

// ─── 默认 state 结构 ──────────────────────────────────────────────────────────
function buildDefaultState() {
  const spirits = {};
  ALL_SHINIES.forEach(name => {
    spirits[name] = { obtained: false, obtainedFrom: null, obtainedAt: null };
  });
  return {
    spirits,
    fruitProgress: {},
    activeTasks: [],
    completedTasks: [],
    userPlanConfig: [],   // 用户自定义方案列表
    ownedFruits: [],      // 已拥有的果实名称列表（果实攻略页标记）
  };
}

// ─── 从 localStorage 读取（离线 / 首屏用）──────────────────────────────────────
function getLocalState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 兼容旧版单任务数据：迁移 activeTask → activeTasks
      if (parsed.activeTask && !parsed.activeTasks) {
        parsed.activeTasks = [parsed.activeTask];
        delete parsed.activeTask;
      }
      if (!parsed.activeTasks) parsed.activeTasks = [];

      // 与默认值合并：确保新增字段对旧数据自动补全
      const defaults = buildDefaultState();
      return {
        ...defaults,          // 先铺默认值（兜底所有新增顶层字段）
        ...parsed,            // 再用旧数据覆盖（保留已有内容）
        spirits: {
          ...defaults.spirits,  // 新增精灵用默认值（obtained: false）
          ...parsed.spirits,    // 旧精灵数据保留
        },
      };
    }
  } catch {}
  return buildDefaultState();
}

// ─── 辅助：更新 activeTasks 中指定 planId 的任务 ─────────────────────────────
function updateTask(tasks, planId, updater) {
  return tasks.map(t => t.planId === planId ? updater(t) : t);
}

// ─── Reducer（保持不变）──────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'START_TASK': {
      if (state.activeTasks.some(t => t.planId === action.planId)) {
        return state;
      }
      const newTask = {
        id: 'task_' + Date.now(),
        planId: action.planId,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        shieldBreaks: [],
        shieldBreakCount: 0,
        failedBreaks: 0,
        ballStart: action.ballStart || null,
      };
      return {
        ...state,
        activeTasks: [...state.activeTasks, newTask],
      };
    }
    case 'RECORD_BREAK': {
      const newBreak = {
        index: 0,
        result: action.result,
        time: new Date().toISOString(),
      };
      return {
        ...state,
        activeTasks: updateTask(state.activeTasks, action.planId, task => {
          newBreak.index = task.shieldBreakCount + 1;
          return {
            ...task,
            shieldBreaks: [...task.shieldBreaks, newBreak],
            shieldBreakCount: task.shieldBreakCount + 1,
          };
        }),
      };
    }
    case 'RECORD_FAILED_BREAK': {
      return {
        ...state,
        activeTasks: updateTask(state.activeTasks, action.planId, task => ({
          ...task,
          failedBreaks: task.failedBreaks + 1,
        })),
      };
    }
    case 'UNDO_BREAK': {
      return {
        ...state,
        activeTasks: updateTask(state.activeTasks, action.planId, task => {
          if (task.shieldBreaks.length === 0) return task;
          return {
            ...task,
            shieldBreaks: task.shieldBreaks.slice(0, -1),
            shieldBreakCount: task.shieldBreakCount - 1,
          };
        }),
      };
    }
    case 'COMPLETE_TASK': {
      const task = state.activeTasks.find(t => t.planId === action.planId);
      if (!task) return state;
      const breakdowns = { original: 0, polluted: 0, shiny: 0 };
      task.shieldBreaks.forEach(b => { breakdowns[b.result]++; });
      const ballStart = task.ballStart;
      const ballEnd = action.ballEnd;
      const ballsUsed = (ballStart != null && ballEnd != null) ? ballStart - ballEnd : null;
      const completed = {
        id: task.id,
        planId: task.planId,
        resultSpirit: action.spiritName,
        resultType: action.isPool ? 'pool' : 'offpool',
        shieldBreakCount: task.shieldBreakCount,
        breakdowns,
        ballsUsed,
        completedAt: new Date().toISOString(),
      };
      const newSpirits = { ...state.spirits };
      if (action.spiritName && newSpirits[action.spiritName]) {
        newSpirits[action.spiritName] = {
          obtained: true,
          obtainedFrom: task.planId,
          obtainedAt: new Date().toISOString(),
        };
      }
      return {
        ...state,
        spirits: newSpirits,
        activeTasks: state.activeTasks.filter(t => t.planId !== action.planId),
        completedTasks: [completed, ...state.completedTasks],
      };
    }
    case 'COMPLETE_AND_CONTINUE': {
      const task = state.activeTasks.find(t => t.planId === action.planId);
      if (!task) return state;
      const breakdowns = { original: 0, polluted: 0, shiny: 0 };
      task.shieldBreaks.forEach(b => { breakdowns[b.result]++; });
      const ballStart = task.ballStart;
      const ballEnd = action.ballEnd;
      const ballsUsed = (ballStart != null && ballEnd != null) ? ballStart - ballEnd : null;
      const completed = {
        id: task.id,
        planId: task.planId,
        resultSpirit: action.spiritName,
        resultType: action.isPool ? 'pool' : 'offpool',
        shieldBreakCount: task.shieldBreakCount,
        breakdowns,
        ballsUsed,
        completedAt: new Date().toISOString(),
      };
      const newSpirits = { ...state.spirits };
      if (action.spiritName && newSpirits[action.spiritName]) {
        newSpirits[action.spiritName] = {
          obtained: true,
          obtainedFrom: task.planId,
          obtainedAt: new Date().toISOString(),
        };
      }
      return {
        ...state,
        spirits: newSpirits,
        activeTasks: updateTask(state.activeTasks, action.planId, t => ({
          ...t,
          id: 'task_' + Date.now(),
          shieldBreaks: [],
          shieldBreakCount: 0,
          failedBreaks: 0,
          startTime: new Date().toISOString(),
          ballStart: ballEnd,
        })),
        completedTasks: [completed, ...state.completedTasks],
      };
    }
    case 'ABANDON_TASK': {
      const task = state.activeTasks.find(t => t.planId === action.planId);
      if (!task) return state;
      if (task.shieldBreakCount === 0) {
        return {
          ...state,
          activeTasks: state.activeTasks.filter(t => t.planId !== action.planId),
        };
      }
      const breakdowns = { original: 0, polluted: 0, shiny: 0 };
      task.shieldBreaks.forEach(b => { breakdowns[b.result]++; });
      const abandoned = {
        id: task.id,
        planId: task.planId,
        resultSpirit: null,
        resultType: 'abandoned',
        shieldBreakCount: task.shieldBreakCount,
        breakdowns,
        completedAt: new Date().toISOString(),
      };
      return {
        ...state,
        activeTasks: state.activeTasks.filter(t => t.planId !== action.planId),
        completedTasks: [abandoned, ...state.completedTasks],
      };
    }
    case 'UPDATE_COMPLETED_BALLS': {
      return {
        ...state,
        completedTasks: state.completedTasks.map(t =>
          t.id === action.taskId ? { ...t, ballsUsed: action.ballsUsed } : t
        ),
      };
    }
    case 'UPDATE_COMPLETED_STATS': {
      return {
        ...state,
        completedTasks: state.completedTasks.map(t => {
          if (t.id !== action.taskId) return t;
          return {
            ...t,
            shieldBreakCount: action.shieldBreakCount ?? t.shieldBreakCount,
            ballsUsed: action.ballsUsed,
            breakdowns: {
              ...t.breakdowns,
              polluted: action.polluted ?? (t.breakdowns?.polluted || 0),
              original: action.original ?? (t.breakdowns?.original || 0),
            },
          };
        }),
      };
    }
    case 'DELETE_COMPLETED_TASK': {
      const taskToDelete = state.completedTasks.find(t => t.id === action.taskId);
      if (!taskToDelete) return state;
      const newCompleted = state.completedTasks.filter(t => t.id !== action.taskId);
      let newSpirits = state.spirits;
      const spiritName = taskToDelete.resultSpirit;
      if (spiritName && taskToDelete.resultType !== 'abandoned') {
        const stillHasRecord = newCompleted.some(
          t => t.resultSpirit === spiritName && t.resultType !== 'abandoned'
        );
        if (!stillHasRecord && state.spirits[spiritName]?.obtained) {
          newSpirits = {
            ...state.spirits,
            [spiritName]: {
              ...state.spirits[spiritName],
              obtained: false,
              obtainedAt: null,
              obtainedFrom: null,
            },
          };
        }
      }
      return {
        ...state,
        spirits: newSpirits,
        completedTasks: newCompleted,
      };
    }
    case 'UPDATE_FRUIT_PROGRESS': {
      return {
        ...state,
        fruitProgress: {
          ...state.fruitProgress,
          [action.key]: action.value,
        },
      };
    }
    case 'TOGGLE_SPIRIT': {
      const s = state.spirits[action.name];
      if (!s) return state;
      return {
        ...state,
        spirits: {
          ...state.spirits,
          [action.name]: {
            ...s,
            obtained: !s.obtained,
            obtainedAt: !s.obtained ? new Date().toISOString() : null,
          },
        },
      };
    }
    case 'SAVE_USER_PLAN': {
      // action.plan: { id?, attrId, label, fruitA, spiritA, fruitB, spiritB }
      const plan = action.plan;
      const existing = (state.userPlanConfig || []).find(p => p.id === plan.id);
      if (existing) {
        // 更新
        return {
          ...state,
          userPlanConfig: state.userPlanConfig.map(p =>
            p.id === plan.id ? { ...p, ...plan, updatedAt: new Date().toISOString() } : p
          ),
        };
      } else {
        // 新建
        const newPlan = {
          ...plan,
          id: plan.id || `user_plan_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...state,
          userPlanConfig: [...(state.userPlanConfig || []), newPlan],
        };
      }
    }
    case 'DELETE_USER_PLAN': {
      return {
        ...state,
        userPlanConfig: (state.userPlanConfig || []).filter(p => p.id !== action.id),
      };
    }
    case 'TOGGLE_OWNED_FRUIT': {
      const owned = state.ownedFruits || [];
      const hasIt = owned.includes(action.fruit);
      return {
        ...state,
        ownedFruits: hasIt
          ? owned.filter(f => f !== action.fruit)
          : [...owned, action.fruit],
      };
    }
    case 'SET_OWNED_FRUITS': {
      // action.fruits: string[]（传空数组即为全清）
      return { ...state, ownedFruits: action.fruits };
    }
    case 'ADD_MANUAL_SHINY': {
      // action.spiritName: 精灵名（必填）
      // action.planId: 方案ID（选填）
      // action.resultType: 'pool'|'offpool'|'manual'
      // action.shieldBreakCount: 触发次数（选填）
      // action.breakdowns: { polluted, original, shiny }（选填）
      // action.ballsUsed: 球数（选填）
      // action.completedAt: 时间（选填）
      const newRecord = {
        id: 'manual_' + Date.now(),
        planId: action.planId ?? null,
        resultSpirit: action.spiritName,
        resultType: action.resultType ?? 'manual',
        shieldBreakCount: action.shieldBreakCount ?? null,
        breakdowns: action.breakdowns ?? { original: 0, polluted: 0, shiny: 0 },
        ballsUsed: action.ballsUsed ?? null,
        completedAt: action.completedAt || new Date().toISOString(),
      };
      const newSpirits = { ...state.spirits };
      if (action.spiritName && newSpirits[action.spiritName]) {
        newSpirits[action.spiritName] = {
          ...newSpirits[action.spiritName],
          obtained: true,
          obtainedFrom: 'manual',
          obtainedAt: newRecord.completedAt,
        };
      }
      return {
        ...state,
        spirits: newSpirits,
        completedTasks: [newRecord, ...state.completedTasks],
      };
    }
    // 内部 action：用云端数据覆盖本地（初始化时使用）
    case '_HYDRATE_FROM_CLOUD': {
      return action.data;
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const StoreContext = createContext(null);

// ─── 工具：从 state + localStorage 计算用户统计 meta 字段 ────────────────────
function buildUserMeta(state) {
  const yise_count = Object.values(state.spirits || {}).filter(s => s.obtained).length;
  const total_breaks = (state.completedTasks || []).reduce(
    (sum, t) => sum + (t.shieldBreakCount || 0), 0
  );
  const platform = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  const avatar    = localStorage.getItem('lk_user_avatar') || null;
  const user_name = localStorage.getItem('lk_username')    || null;
  return { yise_count, total_breaks, platform, avatar, user_name };
}

// ─── 工具：合并本地 + 云端数据（取并集，永不丢失任何一条记录）────────────────
function mergeStates(local, cloud) {
  const defaults = buildDefaultState();

  // completedTasks：按 id 去重，取并集，按时间降序排列
  const taskMap = new Map();
  [...(cloud.completedTasks || []), ...(local.completedTasks || [])].forEach(t => {
    if (!taskMap.has(t.id)) taskMap.set(t.id, t);
  });
  const completedTasks = [...taskMap.values()].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  );

  // activeTasks：以本地为准（进行中的任务只在当前设备有意义）
  const activeTasks = local.activeTasks || [];

  // spirits：任意一边 obtained=true 则视为已获得，取最早的 obtainedAt
  const allSpiritKeys = new Set([
    ...Object.keys(defaults.spirits),
    ...Object.keys(local.spirits || {}),
    ...Object.keys(cloud.spirits || {}),
  ]);
  const spirits = {};
  allSpiritKeys.forEach(name => {
    const l = local.spirits?.[name]  || { obtained: false };
    const c = cloud.spirits?.[name]  || { obtained: false };
    if (l.obtained || c.obtained) {
      // 两边都有获得记录 → 取最早的时间；只有一边有 → 用那边的信息
      const lTime = l.obtainedAt ? new Date(l.obtainedAt) : Infinity;
      const cTime = c.obtainedAt ? new Date(c.obtainedAt) : Infinity;
      const winner = lTime <= cTime ? l : c;
      spirits[name] = { obtained: true, obtainedFrom: winner.obtainedFrom, obtainedAt: winner.obtainedAt };
    } else {
      spirits[name] = { obtained: false, obtainedFrom: null, obtainedAt: null };
    }
  });

  // fruitProgress：两边取 key 并集，值相同时保留，不同时取较大值
  const fruitProgress = { ...(cloud.fruitProgress || {}), ...(local.fruitProgress || {}) };
  Object.keys(cloud.fruitProgress || {}).forEach(k => {
    const lv = local.fruitProgress?.[k];
    const cv = cloud.fruitProgress[k];
    if (lv !== undefined) {
      fruitProgress[k] = typeof lv === 'number' && typeof cv === 'number'
        ? Math.max(lv, cv) : lv;
    }
  });

  // userPlanConfig：按 id 去重，本地版本优先（本地编辑时间更新）
  const planMap = new Map();
  [...(cloud.userPlanConfig || []), ...(local.userPlanConfig || [])].forEach(p => {
    if (!planMap.has(p.id)) planMap.set(p.id, p);
    else {
      // 同 id 取 updatedAt 更新的那个
      const existing = planMap.get(p.id);
      if (p.updatedAt && (!existing.updatedAt || p.updatedAt > existing.updatedAt)) {
        planMap.set(p.id, p);
      }
    }
  });
  const userPlanConfig = [...planMap.values()];

  // ownedFruits：两边取并集（任意一边标记过就保留）
  const localOwned = new Set(local.ownedFruits || []);
  const cloudOwned = new Set(cloud.ownedFruits || []);
  const ownedFruits = [...new Set([...localOwned, ...cloudOwned])];

  return { spirits, fruitProgress, activeTasks, completedTasks, userPlanConfig, ownedFruits };
}

// ─── 工具：从云端拉取并水合数据（始终合并，不丢弃任何一方数据）─────────────
async function hydrateFromCloud(uid, dispatch, localFallback) {
  const { data: row, error } = await supabase
    .from('user_data')
    // 同时拉 avatar / user_name / pending_bind_email，换设备时可还原
    .select('data, avatar, user_name, pending_bind_email')
    .eq('user_id', uid)
    .maybeSingle();

  if (error) throw error;

  const localData = localFallback || getLocalState();

  // 还原云端的 avatar / user_name 到 localStorage（换设备恢复用）
  if (row?.avatar) {
    localStorage.setItem('lk_user_avatar', row.avatar);
  }
  if (row?.user_name && !localStorage.getItem('lk_username')) {
    localStorage.setItem('lk_username', row.user_name);
  }

  let cloudData = row?.data;

  // ── 跨浏览器绑定兜底：新 uid 查不到数据时，尝试用 pending_bind_email 反查旧数据 ──
  // 场景：微信里匿名用户（uid=A）发送绑定邮件，Safari 打开链接后 uid 变成 B
  //       数据存在 A 下面，用邮箱列 pending_bind_email 反查 A 的数据并合并
  if (!cloudData || (!cloudData.spirits && !cloudData.completedTasks)) {
    try {
      // 尝试通过 user_email 反查（旧 uid 行里已写好邮箱）
      const { data: rows } = await supabase
        .from('user_data')
        .select('user_id, data, avatar, user_name')
        .eq('pending_bind_email', uid) // 这里先用邮箱列查，下面再用 eq user_email
        .maybeSingle();
      // 备选：用 user_email 反查
      if (!rows?.data) {
        // 获取当前 session 的 email
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;
        if (email) {
          const { data: emailRow } = await supabase
            .from('user_data')
            .select('user_id, data, avatar, user_name')
            .eq('pending_bind_email', email)
            .maybeSingle();
          if (emailRow?.data) {
            cloudData = emailRow.data;
            // 还原 avatar / user_name
            if (emailRow.avatar) localStorage.setItem('lk_user_avatar', emailRow.avatar);
            if (emailRow.user_name && !localStorage.getItem('lk_username')) {
              localStorage.setItem('lk_username', emailRow.user_name);
            }
            console.log('[Supabase] 跨浏览器绑定兜底：从旧 uid 恢复数据成功');
          }
        }
      }
    } catch (e) {
      console.warn('[Supabase] 跨浏览器兜底查询失败:', e.message);
    }
  }

  if (cloudData && (cloudData.spirits || cloudData.completedTasks)) {
    // 云端有数据 → 与本地合并，取并集
    if (cloudData.activeTask && !cloudData.activeTasks) {
      cloudData.activeTasks = [cloudData.activeTask];
      delete cloudData.activeTask;
    }
    if (!cloudData.activeTasks) cloudData.activeTasks = [];

    const merged = mergeStates(localData, cloudData);
    dispatch({ type: '_HYDRATE_FROM_CLOUD', data: merged });
    // 把合并结果上传到新的 uid 下，并清除 pending_bind_email
    try {
      const meta = buildUserMeta(merged);
      await supabase.from('user_data').upsert({
        user_id: uid,
        data: merged,
        pending_bind_email: null,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        ...meta,
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('[Supabase] 写入合并数据失败:', e.message);
    }
    return 'merged';
  } else {
    // 云端无有效数据（新账号/首次绑定）→ 直接上传本地数据
    const meta = buildUserMeta(localData);
    await supabase.from('user_data').upsert({
      user_id: uid,
      data: localData,
      pending_bind_email: null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      ...meta,
    }, { onConflict: 'user_id' });
    return 'uploaded';
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getLocalState);
  // 云同步状态：'idle' | 'syncing' | 'ready' | 'offline'
  const [syncStatus, setSyncStatus] = useState('idle');
  // 当前登录的用户 ID（匿名或正式账号）
  const [userId, setUserId] = useState(null);
  // 当前 session 的 user 对象（供 Profile 等读取 email）
  const [authUser, setAuthUser] = useState(null);
  // 是否已完成初始化（防止初始化前的 state 变更触发误写）
  const [initialized, setInitialized] = useState(false);
  // 用 ref 持有最新 userId，避免 onAuthStateChange 闭包过期问题
  const userIdRef = useRef(null);
  // init 是否已经完成（区分 SDK 启动时的自动 SIGNED_IN 与用户操作触发的）
  const initDoneRef = useRef(false);
  // 绑定/登录成功后弹出的全局 Toast
  // { type: 'bind' | 'login', email: string } | null
  const [authToast, setAuthToast] = useState(null);

  // ── 初始化：匿名登录 + 拉取云端数据 ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setSyncStatus('syncing');
      try {
        // 1. 获取已有 session，没有则静默匿名登录
        let { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          session = data.session;
        }
        if (cancelled) return;

        const uid = session.user.id;
        userIdRef.current = uid;
        setUserId(uid);
        setAuthUser(session.user);

        // 2. 从云端拉取或上传数据
        await hydrateFromCloud(uid, dispatch, getLocalState());
        setSyncStatus('ready');

        // 3. 上报本次活跃时间（不管用户有没有操作，打开 App 就算活跃）
        supabase.from('user_data').upsert({
          user_id: uid,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(({ error }) => {
          if (error) console.warn('[Supabase] 活跃上报失败:', error.message);
        });
      } catch (err) {
        console.warn('[Supabase] 初始化失败，降级为本地模式:', err.message);
        setSyncStatus('offline');
      } finally {
        if (!cancelled) {
          setInitialized(true);
          initDoneRef.current = true;
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // ── Auth 状态监听：只挂载一次，处理邮件链接点击后的登录/升级事件 ──────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const uid = session?.user?.id ?? null;
        const prevUid = userIdRef.current;

        // INITIAL_SESSION：App 冷启动时 SDK 恢复 session
        // 如果 init() 还没完成就先到这里，补设 authUser（PKCE 流下尤其重要）
        if (event === 'INITIAL_SESSION') {
          if (session?.user && !initDoneRef.current) {
            setAuthUser(session.user);
            userIdRef.current = uid;
            setUserId(uid);
          }
          return;
        }

        // USER_UPDATED：匿名账号绑定邮箱确认（uid 不变，email 被填上）
        if (event === 'USER_UPDATED') {
          // init 未完成时跳过，让 init() 的 getSession 兜底处理最终态
          if (!session || !initDoneRef.current) return;
          const newEmail = session.user.email;
          setAuthUser(session.user);
          // 仅当 email 是新出现的（之前是匿名）才弹 Toast，并写入云端用户信息
          if (newEmail && !authUser?.email) {
            setAuthToast({ type: 'bind', email: newEmail });
            // 绑定成功：写入 user_email / user_name / avatar
            const avatar    = localStorage.getItem('lk_user_avatar') || null;
            const user_name = localStorage.getItem('lk_username')    || null;
            supabase.from('user_data').upsert({
              user_id: uid,
              user_email: newEmail,
              user_name,
              avatar,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' }).then(({ error }) => {
              if (error) console.warn('[Supabase] 更新用户信息失败:', error.message);
            });
          }
          return;
        }

        // SIGNED_IN：OTP 魔法链接登录
        if (event === 'SIGNED_IN') {
          if (!session) return;
          // init 未完成时跳过，避免与 init() 并发执行 hydrateFromCloud
          if (!initDoneRef.current) return;

          // uid 相同 = 同设备同账号
          if (uid === prevUid) {
            if (session.user.email && !authUser?.email) {
              setAuthUser(session.user);
              setAuthToast({ type: 'bind', email: session.user.email });
              // 写入 user_email / user_name / avatar
              const avatar    = localStorage.getItem('lk_user_avatar') || null;
              const user_name = localStorage.getItem('lk_username')    || null;
              supabase.from('user_data').upsert({
                user_id: uid,
                user_email: session.user.email,
                user_name,
                avatar,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' }).then(({ error }) => {
                if (error) console.warn('[Supabase] 更新用户信息失败:', error.message);
              });
            }
            return;
          }

          // uid 不同 = 换设备 OTP 登录 / 邮件找回，合并云端 + 本地数据
          setAuthUser(session.user);
          setUserId(uid);
          userIdRef.current = uid;
          setSyncStatus('syncing');
          try {
            // 传入当前本地数据作为 localFallback，确保合并时不丢本地记录
            await hydrateFromCloud(uid, dispatch, getLocalState());
            setSyncStatus('ready');
            if (session.user.email) {
              setAuthToast({ type: 'login', email: session.user.email });
              // 更新 user_email + last_active_at（user_name/avatar 已由 hydrateFromCloud 处理）
              supabase.from('user_data').upsert({
                user_id: uid,
                user_email: session.user.email,
                last_active_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' }).then(({ error }) => {
                if (error) console.warn('[Supabase] 更新用户信息失败:', error.message);
              });
            }
          } catch (err) {
            console.warn('[Supabase] auth 事件同步失败:', err.message);
            setSyncStatus('offline');
          }
          return;
        }

        if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setUserId(null);
          userIdRef.current = null;
          setSyncStatus('offline');
        }
      }
    );

    return () => subscription.unsubscribe();
  // authUser 加入依赖，确保闭包里读到最新值
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // ── 持久化：state 变更时同步写 localStorage + 云端 ────────────────────────
  useEffect(() => {
    // 写 localStorage（离线缓存，始终执行）
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // 初始化完成 + 有用户 ID + 不是离线模式 → 异步写云端
    if (!initialized || !userId || syncStatus === 'offline') return;

    const meta = buildUserMeta(state);
    supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data: state,
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        // 若 authUser 已有邮箱也一并同步（冗余保险）
        ...(authUser?.email ? { user_email: authUser.email } : {}),
        ...meta,
      }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) console.warn('[Supabase] 同步失败:', error.message);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, initialized, userId, syncStatus]);

  // ── 强制立即同步（绑定邮箱前调用，确保云端有数据）─────────────────────────
  // email: 用户即将绑定/登录的邮箱，写入 pending_bind_email 供跨浏览器兜底查询
  // 返回 Promise<'ok' | 'offline' | 'no_user'>
  const forceSyncNow = async (email) => {
    if (!userId) return 'no_user';
    if (syncStatus === 'offline') return 'offline';
    try {
      const meta = buildUserMeta(state);
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data: state,
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          ...(authUser?.email ? { user_email: authUser.email } : {}),
          // 把目标邮箱写入 pending_bind_email 列，供 Safari 打开链接后反查旧数据
          ...(email ? { pending_bind_email: email } : {}),
          ...meta,
        }, { onConflict: 'user_id' });
      if (error) throw error;
      return 'ok';
    } catch (err) {
      console.warn('[Supabase] forceSyncNow 失败:', err.message);
      return 'offline';
    }
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, syncStatus, userId, authUser, authToast, clearAuthToast: () => setAuthToast(null), forceSyncNow }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
