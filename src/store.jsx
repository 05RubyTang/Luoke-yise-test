import { createContext, useContext, useReducer, useEffect } from 'react';
import { ALL_SHINIES } from './data/plans';

const STORAGE_KEY = 'roco-shiny-helper';

function getInitialState() {
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
      return parsed;
    }
  } catch {}
  const spirits = {};
  ALL_SHINIES.forEach(name => {
    spirits[name] = { obtained: false, obtainedFrom: null, obtainedAt: null };
  });
  return {
    spirits,
    fruitProgress: {},
    activeTasks: [],
    completedTasks: [],
  };
}

// 辅助：更新 activeTasks 中指定 planId 的任务
function updateTask(tasks, planId, updater) {
  return tasks.map(t => t.planId === planId ? updater(t) : t);
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_TASK': {
      // 如果该方案已有进行中任务，不重复创建
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
        ballStart: action.ballStart || null, // 初始精灵球库存
      };
      return {
        ...state,
        activeTasks: [...state.activeTasks, newTask],
      };
    }
    case 'RECORD_BREAK': {
      const newBreak = {
        index: 0, // will be set below
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
      // 计算消耗球数：初始球数 - 出货时球数
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
        // 继续刷：重置破盾，ballStart 更新为本次出货时的球数（下一轮的起点）
        activeTasks: updateTask(state.activeTasks, action.planId, t => ({
          ...t,
          id: 'task_' + Date.now(),
          shieldBreaks: [],
          shieldBreakCount: 0,
          failedBreaks: 0,
          startTime: new Date().toISOString(),
          ballStart: ballEnd, // 上次出货时的球数作为下一轮起点
        })),
        completedTasks: [completed, ...state.completedTasks],
      };
    }
    case 'ABANDON_TASK': {
      const task = state.activeTasks.find(t => t.planId === action.planId);
      if (!task) return state;
      // 如果没有破盾记录，直接删除不存历史
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
      // 编辑已完成任务的球耗：通过 taskId 定位
      return {
        ...state,
        completedTasks: state.completedTasks.map(t =>
          t.id === action.taskId ? { ...t, ballsUsed: action.ballsUsed } : t
        ),
      };
    }
    case 'UPDATE_COMPLETED_STATS': {
      // 编辑已完成任务的所有统计字段
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
      // 如果该精灵是成功出货的，检查剩余记录里是否还有该精灵的出货
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
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
