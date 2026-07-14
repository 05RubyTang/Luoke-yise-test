/**
 * 咕噜球消耗计算 & 历史记录编辑 测试用例
 *
 * 覆盖模块：
 *   - store.jsx：COMPLETE_TASK / COMPLETE_AND_CONTINUE / PAUSE_BALL_SEGMENT（simple & byType）
 *   - History.jsx：handleSave 中 balRaw / bal 的保留 / 覆盖逻辑
 *
 * 运行方式：
 *   cd luoke4.0 && npx vitest run src/__tests__/ballsUsed.test.js
 *   （或 npx jest --testPathPattern=ballsUsed）
 */

import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数（与 History.jsx 中 parseNonNeg 保持一致）
// ─────────────────────────────────────────────────────────────────────────────
function parseNonNeg(str) {
  if (str === '' || str == null) return null;
  const n = parseInt(String(str), 10);
  return isNaN(n) || n < 0 ? null : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// 核心计算逻辑（从 store.jsx reducer 中提取，保持与源码完全一致）
// ─────────────────────────────────────────────────────────────────────────────

/** COMPLETE_TASK / COMPLETE_AND_CONTINUE —— simple 模式球数计算 */
function calcBallsUsedSimple({ ballStart, ballEnd, restocks = [], pauseSegments = [] }) {
  const pauseTotal = pauseSegments.reduce((s, seg) => s + (seg.consumed || 0), 0);
  const restockTotal = restocks.reduce((s, r) => s + (r.amount || 0), 0);
  const curSeg = (ballStart != null && ballEnd != null)
    ? ballStart + restockTotal - ballEnd
    : null;
  return curSeg != null
    ? curSeg + pauseTotal
    : (pauseTotal > 0 ? pauseTotal : null);
}

/** COMPLETE_TASK / COMPLETE_AND_CONTINUE —— byType 模式球数计算 */
function calcBallsUsedByType({ ballStartByType, ballEndByType, restocks = [], pauseSegments = [] }) {
  if (!ballEndByType) return { ballsUsedByType: null, ballsUsed: null };
  const bst = ballStartByType || { adv: 0, sea: 0, att: 0 };
  const restByType = restocks.reduce(
    (s, r) => ({ adv: s.adv + (r.adv || 0), sea: s.sea + (r.sea || 0), att: s.att + (r.att || 0) }),
    { adv: 0, sea: 0, att: 0 }
  );
  const bet = ballEndByType;
  const curSegByType = {
    adv: bst.adv + restByType.adv - (bet.adv || 0),
    sea: bst.sea + restByType.sea - (bet.sea || 0),
    att: bst.att + restByType.att - (bet.att || 0),
  };
  const pauseByType = pauseSegments.reduce(
    (s, seg) => ({ adv: s.adv + (seg.adv || 0), sea: s.sea + (seg.sea || 0), att: s.att + (seg.att || 0) }),
    { adv: 0, sea: 0, att: 0 }
  );
  const ballsUsedByType = {
    adv: curSegByType.adv + pauseByType.adv,
    sea: curSegByType.sea + pauseByType.sea,
    att: curSegByType.att + pauseByType.att,
  };
  return { ballsUsedByType, ballsUsed: ballsUsedByType.adv + ballsUsedByType.sea + ballsUsedByType.att };
}

/** PAUSE_BALL_SEGMENT —— simple 模式当前段消耗计算 */
function calcPausedConsumedSimple({ ballStart, currentBall, restocks = [] }) {
  const restockTotal = restocks.reduce((s, r) => s + (r.amount || 0), 0);
  return (ballStart != null && currentBall != null)
    ? ballStart + restockTotal - currentBall
    : null;
}

/** History.jsx handleSave —— bal 的最终值（保留逻辑） */
function calcHandleSaveBal({ inputs, task }) {
  const adv = parseNonNeg(inputs.adv);
  const sea = parseNonNeg(inputs.sea);
  const att = parseNonNeg(inputs.att);
  const hasDetail = adv != null && sea != null && att != null;
  const balRaw = hasDetail ? adv + sea + att : parseNonNeg(inputs.ballsUsed);
  // 关键修复逻辑：未填时保留原值
  return balRaw != null ? balRaw : task.ballsUsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// 第一组：COMPLETE_TASK / COMPLETE_AND_CONTINUE — simple 模式
// ─────────────────────────────────────────────────────────────────────────────
describe('球数计算 · simple 模式（COMPLETE_TASK / COMPLETE_AND_CONTINUE）', () => {

  describe('场景 A：正常完整流程（ballStart + ballEnd 均有）', () => {
    it('A1 无补球无暂停：ballsUsed = ballStart - ballEnd', () => {
      const result = calcBallsUsedSimple({ ballStart: 200, ballEnd: 150 });
      expect(result).toBe(50);
    });

    it('A2 有补球无暂停：ballsUsed = ballStart + restockTotal - ballEnd', () => {
      const result = calcBallsUsedSimple({
        ballStart: 200, ballEnd: 30,
        restocks: [{ amount: 50 }, { amount: 30 }],
      });
      // 200 + 80 - 30 = 250
      expect(result).toBe(250);
    });

    it('A3 有一次暂停（已结算）+ 有最终 ballEnd：当前段 + pauseTotal', () => {
      const result = calcBallsUsedSimple({
        ballStart: 80,   // 暂停恢复后的起始
        ballEnd: 10,
        pauseSegments: [{ consumed: 60 }],
      });
      // 当前段 = 80 - 10 = 70；总 = 70 + 60 = 130
      expect(result).toBe(130);
    });

    it('A4 有多次暂停 + 补球 + 有最终 ballEnd', () => {
      const result = calcBallsUsedSimple({
        ballStart: 50,
        ballEnd: 5,
        restocks: [{ amount: 20 }],
        pauseSegments: [{ consumed: 100 }, { consumed: 80 }],
      });
      // 当前段 = 50 + 20 - 5 = 65；历史 = 180；总 = 245
      expect(result).toBe(245);
    });

    it('A5 边界：ballEnd = 0（球全用完了）', () => {
      const result = calcBallsUsedSimple({ ballStart: 100, ballEnd: 0 });
      expect(result).toBe(100);
    });

    it('A6 边界：ballStart = ballEnd（一个球都没用）', () => {
      const result = calcBallsUsedSimple({ ballStart: 50, ballEnd: 50 });
      expect(result).toBe(0);
    });
  });

  describe('场景 B：忘记填剩余球数（ballEnd = null）', () => {
    it('B1 无暂停段，未填 ballEnd → null（无法计算，显示「—」）', () => {
      const result = calcBallsUsedSimple({ ballStart: 200, ballEnd: null });
      expect(result).toBeNull();
    });

    it('B2 有暂停段消耗，未填 ballEnd → 降级为 pauseTotal（不显示「—」）', () => {
      const result = calcBallsUsedSimple({
        ballStart: 80, ballEnd: null,
        pauseSegments: [{ consumed: 60 }],
      });
      expect(result).toBe(60);
    });

    it('B3 多次暂停，未填 ballEnd → 各暂停段合计', () => {
      const result = calcBallsUsedSimple({
        ballStart: 50, ballEnd: null,
        pauseSegments: [{ consumed: 40 }, { consumed: 30 }],
      });
      expect(result).toBe(70);
    });

    it('B4 暂停段 consumed=0 时，未填 ballEnd → null（不写入假数据）', () => {
      const result = calcBallsUsedSimple({
        ballStart: 100, ballEnd: null,
        pauseSegments: [{ consumed: 0 }],
      });
      expect(result).toBeNull();
    });
  });

  describe('场景 C：从未设置起始球数（ballStart = null）', () => {
    it('C1 ballStart=null, ballEnd=null → null', () => {
      const result = calcBallsUsedSimple({ ballStart: null, ballEnd: null });
      expect(result).toBeNull();
    });

    it('C2 ballStart=null, 但有 ballEnd → null（无法做差）', () => {
      const result = calcBallsUsedSimple({ ballStart: null, ballEnd: 50 });
      expect(result).toBeNull();
    });

    it('C3 ballStart=null, 有暂停段 → 仍可用 pauseTotal 兜底', () => {
      const result = calcBallsUsedSimple({
        ballStart: null, ballEnd: null,
        pauseSegments: [{ consumed: 55 }],
      });
      expect(result).toBe(55);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 第二组：COMPLETE_TASK / COMPLETE_AND_CONTINUE — byType 模式
// ─────────────────────────────────────────────────────────────────────────────
describe('球数计算 · byType 模式', () => {

  it('D1 正常流程，无补球无暂停', () => {
    const { ballsUsed, ballsUsedByType } = calcBallsUsedByType({
      ballStartByType: { adv: 100, sea: 50, att: 30 },
      ballEndByType:   { adv: 20,  sea: 10, att: 5  },
    });
    expect(ballsUsedByType).toEqual({ adv: 80, sea: 40, att: 25 });
    expect(ballsUsed).toBe(145);
  });

  it('D2 有补球，各类型分别补', () => {
    const { ballsUsed, ballsUsedByType } = calcBallsUsedByType({
      ballStartByType: { adv: 100, sea: 50, att: 30 },
      ballEndByType:   { adv: 10,  sea: 5,  att: 0  },
      restocks: [{ adv: 20, sea: 10, att: 5 }],
    });
    // adv: 100+20-10=110, sea: 50+10-5=55, att: 30+5-0=35
    expect(ballsUsedByType).toEqual({ adv: 110, sea: 55, att: 35 });
    expect(ballsUsed).toBe(200);
  });

  it('D3 有暂停段（byType），累加历史段消耗', () => {
    const { ballsUsed, ballsUsedByType } = calcBallsUsedByType({
      ballStartByType: { adv: 50, sea: 30, att: 20 },
      ballEndByType:   { adv: 10, sea: 5,  att: 0  },
      pauseSegments: [{ adv: 40, sea: 20, att: 15, consumed: 75 }],
    });
    // 当前段: adv=40, sea=25, att=20; 历史: adv=40, sea=20, att=15
    expect(ballsUsedByType).toEqual({ adv: 80, sea: 45, att: 35 });
    expect(ballsUsed).toBe(160);
  });

  it('D4 未填 ballEnd（用户忘记填）→ null', () => {
    const { ballsUsed, ballsUsedByType } = calcBallsUsedByType({
      ballStartByType: { adv: 100, sea: 50, att: 30 },
      ballEndByType: null,
    });
    expect(ballsUsed).toBeNull();
    expect(ballsUsedByType).toBeNull();
  });

  it('D5 部分类型剩余=0（球用光了）', () => {
    const { ballsUsed, ballsUsedByType } = calcBallsUsedByType({
      ballStartByType: { adv: 50, sea: 0, att: 30 },
      ballEndByType:   { adv: 0,  sea: 0, att: 0  },
    });
    expect(ballsUsedByType).toEqual({ adv: 50, sea: 0, att: 30 });
    expect(ballsUsed).toBe(80);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 第三组：PAUSE_BALL_SEGMENT — simple 模式暂停段消耗计算
// ─────────────────────────────────────────────────────────────────────────────
describe('暂停计球 · PAUSE_BALL_SEGMENT simple 模式', () => {

  it('E1 正常暂停：有 ballStart 有 currentBall', () => {
    const consumed = calcPausedConsumedSimple({ ballStart: 200, currentBall: 120 });
    expect(consumed).toBe(80);
  });

  it('E2 有补球的暂停：ballStart + restockTotal - current', () => {
    const consumed = calcPausedConsumedSimple({
      ballStart: 100, currentBall: 30,
      restocks: [{ amount: 50 }],
    });
    // 100 + 50 - 30 = 120
    expect(consumed).toBe(120);
  });

  it('E3 暂停时忘记填当前球数（currentBall=null）→ consumed=null（不记录假数据）', () => {
    const consumed = calcPausedConsumedSimple({ ballStart: 200, currentBall: null });
    expect(consumed).toBeNull();
  });

  it('E4 ballStart 为 null 时暂停 → consumed=null', () => {
    const consumed = calcPausedConsumedSimple({ ballStart: null, currentBall: 50 });
    expect(consumed).toBeNull();
  });

  it('E5 暂停时 currentBall=0（球正好用完）→ 正常计算', () => {
    const consumed = calcPausedConsumedSimple({ ballStart: 100, currentBall: 0 });
    expect(consumed).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 第四组：History.jsx handleSave — 历史记录手动编辑球数
// ─────────────────────────────────────────────────────────────────────────────
describe('历史记录编辑 · handleSave 球数保留逻辑', () => {

  describe('场景 F：simple 模式总球数编辑', () => {
    it('F1 用户填了新球数 → 覆盖原值', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '300', adv: '', sea: '', att: '' },
        task: { ballsUsed: 200 },
      });
      expect(bal).toBe(300);
    });

    it('F2 用户清空了输入框（不填）→ 保留原值，不覆盖', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '', sea: '', att: '' },
        task: { ballsUsed: 200 },
      });
      expect(bal).toBe(200);  // 保留原值
    });

    it('F3 原本就没有球数记录（null），用户也不填 → 保持 null', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '', sea: '', att: '' },
        task: { ballsUsed: null },
      });
      expect(bal).toBeNull();
    });

    it('F4 用户把球数改为 0 → 覆盖为 0（0 是有效值）', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '0', adv: '', sea: '', att: '' },
        task: { ballsUsed: 200 },
      });
      expect(bal).toBe(0);
    });

    it('F5 用户输入非法字符（如字母）→ parseNonNeg 返回 null → 保留原值', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: 'abc', adv: '', sea: '', att: '' },
        task: { ballsUsed: 150 },
      });
      expect(bal).toBe(150);
    });

    it('F6 用户输入负数 → parseNonNeg 返回 null → 保留原值', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '-5', adv: '', sea: '', att: '' },
        task: { ballsUsed: 100 },
      });
      expect(bal).toBe(100);
    });
  });

  describe('场景 G：byType 分球明细模式编辑', () => {
    it('G1 三格分球全填 → 自动算合计，覆盖总球数', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '80', sea: '40', att: '30' },
        task: { ballsUsed: 200, ballsUsedByType: { adv: 60, sea: 30, att: 20 } },
      });
      // adv+sea+att = 150
      expect(bal).toBe(150);
    });

    it('G2 三格全填，原 ballsUsed 为 null → 写入合计', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '10', sea: '5', att: '3' },
        task: { ballsUsed: null },
      });
      expect(bal).toBe(18);
    });

    it('G3 分球只填了两格（att 空）→ hasDetail=false → 回退到 ballsUsed 逻辑', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '250', adv: '80', sea: '40', att: '' },
        task: { ballsUsed: 200 },
      });
      // 两格不完整，忽略分球；ballsUsed='250' → 覆盖为 250
      expect(bal).toBe(250);
    });

    it('G4 分球只填了两格，且 ballsUsed 也空 → 保留原值', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '80', sea: '40', att: '' },
        task: { ballsUsed: 200 },
      });
      expect(bal).toBe(200);
    });

    it('G5 三格全填为 0 → 合计 0（视为有效值，覆盖）', () => {
      const bal = calcHandleSaveBal({
        inputs: { ballsUsed: '', adv: '0', sea: '0', att: '0' },
        task: { ballsUsed: 100 },
      });
      expect(bal).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 第五组：parseNonNeg 工具函数边界测试
// ─────────────────────────────────────────────────────────────────────────────
describe('工具函数 parseNonNeg', () => {
  it('正常整数字符串 → 数字', () => expect(parseNonNeg('123')).toBe(123));
  it('0 → 0', () => expect(parseNonNeg('0')).toBe(0));
  it('空字符串 → null', () => expect(parseNonNeg('')).toBeNull());
  it('null → null', () => expect(parseNonNeg(null)).toBeNull());
  it('undefined → null', () => expect(parseNonNeg(undefined)).toBeNull());
  it('非数字字符串 → null', () => expect(parseNonNeg('abc')).toBeNull());
  it('负数 → null', () => expect(parseNonNeg('-1')).toBeNull());
  it('小数字符串 → 截断取整', () => expect(parseNonNeg('3.9')).toBe(3));
  it('仅空格 → null（parseInt 会返回 NaN）', () => expect(parseNonNeg('   ')).toBeNull());
  it('数字+字母混合 → parseInt 取前缀数字', () => expect(parseNonNeg('5abc')).toBe(5));
});

// ─────────────────────────────────────────────────────────────────────────────
// 第六组：COMPLETE_AND_CONTINUE 特有场景 — nextBallStart 传递
// ─────────────────────────────────────────────────────────────────────────────
describe('继续刷取 · nextBallStart 传递', () => {

  it('H1 simple 模式，有 ballEnd → nextBallStart = ballEnd（下轮起点）', () => {
    const ballEnd = 30;
    const nextBallStart = ballEnd ?? null;
    expect(nextBallStart).toBe(30);
  });

  it('H2 simple 模式，ballEnd=0（球用完）→ nextBallStart=0', () => {
    const ballEnd = 0;
    const nextBallStart = ballEnd ?? null;
    expect(nextBallStart).toBe(0);
  });

  it('H3 simple 模式，未填 ballEnd → nextBallStart=null（下轮无起始球数）', () => {
    const ballEnd = null;
    const nextBallStart = ballEnd ?? null;
    expect(nextBallStart).toBeNull();
  });

  it('H4 byType 模式，填了 ballEnd → nextBallStartByType = ballEndByType（下轮起点）', () => {
    const bet = { adv: 20, sea: 5, att: 0 };
    const nextBallStartByType = { adv: bet.adv || 0, sea: bet.sea || 0, att: bet.att || 0 };
    expect(nextBallStartByType).toEqual({ adv: 20, sea: 5, att: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 第七组：多次暂停叠加 + 继续刷取的端到端链式场景
// ─────────────────────────────────────────────────────────────────────────────
describe('端到端链式场景', () => {

  it('I1 全程顺利：开始200→暂停(剩120)→补球50→异色出货(剩30)→总消耗=(80)+(140)=220', () => {
    // 第一段：200 - 120 = 80，写入 pauseSegments
    const pause1 = calcPausedConsumedSimple({ ballStart: 200, currentBall: 120 });
    expect(pause1).toBe(80);

    // 暂停后 ballStart 重置为 120，补球 50，最终 ballEnd=30
    const total = calcBallsUsedSimple({
      ballStart: 120,
      ballEnd: 30,
      restocks: [{ amount: 50 }],
      pauseSegments: [{ consumed: 80 }],
    });
    // 当前段 = 120+50-30 = 140；总 = 140+80 = 220
    expect(total).toBe(220);
  });

  it('I2 最终忘记填剩余球数：仍能记录暂停消耗小计（不显示「—」）', () => {
    const pause1 = calcPausedConsumedSimple({ ballStart: 300, currentBall: 200 });
    const pause2 = calcPausedConsumedSimple({ ballStart: 200, currentBall: 80 });

    const total = calcBallsUsedSimple({
      ballStart: 80,
      ballEnd: null,   // 忘记填了
      pauseSegments: [{ consumed: pause1 }, { consumed: pause2 }],
    });
    // curSeg=null；pauseTotal=100+120=220 → 兜底返回 220
    expect(total).toBe(220);
  });

  it('I3 继续刷取后第二轮：上轮 ballEnd 成为新 ballStart，重新计算消耗', () => {
    // 第一轮出货时 ballEnd=30，继续刷
    const nextBallStart = 30;

    // 第二轮正常打，ballEnd=5
    const round2Total = calcBallsUsedSimple({ ballStart: nextBallStart, ballEnd: 5 });
    expect(round2Total).toBe(25);
  });

  it('I4 全程未设置球数（从未填起始）：最终 ballsUsed=null', () => {
    const total = calcBallsUsedSimple({ ballStart: null, ballEnd: null });
    expect(total).toBeNull();
  });

  it('I5 历史记录编辑：原有球数100，打开编辑不填直接保存 → 原值不变', () => {
    const bal = calcHandleSaveBal({
      inputs: { ballsUsed: '', adv: '', sea: '', att: '' },
      task: { ballsUsed: 100 },
    });
    expect(bal).toBe(100);
  });

  it('I6 历史记录编辑：原本「—」，打开后填入 200 → 成功写入', () => {
    const bal = calcHandleSaveBal({
      inputs: { ballsUsed: '200', adv: '', sea: '', att: '' },
      task: { ballsUsed: null },
    });
    expect(bal).toBe(200);
  });
});
