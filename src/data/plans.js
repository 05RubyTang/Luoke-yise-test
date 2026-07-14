// 果实方案常量数据
// 规则说明：只有属性1会计入池子，属性2方案已全部失效，现均为单果实循环

import { SEASONS } from './seasons.js';
import { S1_PLANS, S2_PLANS } from './seasons/index.js';
// S3 待上线，暂不引入；上线时改为：import { S1_PLANS, S2_PLANS, S3_PLANS } from './seasons/index.js';
import { getPlanFruitsArray } from './common/getPlanFruitsArray.js';

const base = import.meta.env.BASE_URL;

// 重新导出：赛季方案数据和通用函数
// ═══════════════════════════════════════════════════════════════════════

export { S1_PLANS, S2_PLANS };
export { getPlanFruitsArray };

// S3 待上线，暂用空数组占位，避免各页面 import S3_PLANS 报错
// S3 上线时：删除此行，改为从 seasons/index.js 导出真实数据
export const S3_PLANS = [];

// ─── 合并 S1、S2 方案（S3 上线时加入 ...S3_PLANS） ──────────────────────────
export const PLANS = [...S1_PLANS, ...S2_PLANS];
// S3 上线时改为：export const PLANS = [...S1_PLANS, ...S2_PLANS, ...S3_PLANS];

// ─── 属性 ID 集合（用于判断是否属于"属性系"池子） ────────────────────────────
const BASE_IDS = new Set([
  'fire', 'ice', 'electric', 'phantom', 'grass', 'evil', 'ghost', 'mech', 'light', 'light_fluffy',
  'water', 'cute', 'normal', 'poison',  // S2 新增普通系、毒系
  // S3 上线时取消注释：'ground', 'bug', 'fighting',
]);

// ─── 属性 ID → 中文属性名映射（用于三池进度标签展示） ─────────────────────────
export const ATTR_LABEL = {
  fire:        '火系',
  ice:         '冰系',
  electric:    '电系',
  phantom:     '幻系',
  grass:       '草系',
  evil:        '恶系',
  ghost:       '幽系',
  mech:        '机械系',
  light:       '光系',
  light_fluffy:'光系',
  water:       '水系',
  cute:        '萌系',
  normal:      '普通系',
  poison:      '毒系',
  wing:        '翼系',
  dragon:      '龙系',
  ground:      '地系',   // S3 新增
  bug:         '虫系',   // S3 新增
  fighting:    '武系',   // S3 新增
};

// ─── 果实名 → 属系 ID 映射 ─────────────────────────────────────────────────
export const FRUIT_ATTR = {
  '治愈兔果实':    'fire',
  '火红尾果实':    'fire',
  '柴渣虫果实':    'fire',
  '呼呼猪果实':    'ice',
  '大耳帽兜果实':  'ice',
  '月牙雪熊果实':  'ice',
  '拉特果实':      'electric',
  '小星光果实':    'electric',
  '粉粉星果实':    'electric',
  '双灯鱼果实':    'electric',
  '哭哭菇果实':    'phantom',
  '仪使者果实':    'phantom',
  '粉星仔果实':    'phantom',
  '格兰种子果实':  'grass',
  '奇丽草果实':    'grass',
  '小夜果实':      'evil',
  '恶魔狼果实':    'evil',
  '嗜光嗡嗡果实':  'evil',
  '小灵面果实':    'ghost',
  '梦游果实':      'ghost',
  '空空颅果实':    'ghost',
  '机械方方果实':  'mech',
  '贝瑟果实':      'mech',
  '圣剑侍从果实':  'mech',
  '独角兽果实':    'light',
  '犀角鸟果实':    'light',
  '疾光千兽果实':  'light',
  '绒绒果实':      'light',   // 绒仙子/疾光千兽家族（绒绒为进化前形态）
  '绒仙子果实':    'light',   // 旧数据兜底
  '火焰猿果实':    'fire',
  '尖嘴狐仙果实':  'fire',
  '蹦蹦花果实':    'grass',
  '波多西果实':    'mech',
  '圣剑侍从果实':  'mech',
  '深蓝鲸果实':    'water',
  '菊花梨果实':    'cute',
  '小独角兽果实':  'light',
  // S2 赛季奇遇 & 单刷专属果实
  '恶魔叮果实':    'evil',
  '公平鸽果实':    'normal',
  '灵狐果实':      'fire',
  '嘟嘟煲果实':    'poison',
  '幽影树果实':    'ghost',
  '小丑豆豆果实':  'evil',    // 小丑豆豆→小丑兔→小丑公爵
  '小鼓象果实':    'mech',
  '猴麦仔果实':    'normal',  // 猴麦仔→音碟吼（普通+机械双属，主属普通系）
  '烟花团果实':    'fire',    // 烟花团→烟花图案→烟花伯爵（火+毒双属，主属火系）
  '牵线木偶果实':  'phantom', // 牵线木偶→帅帅魔偶
  '炫光迪迪果实':  'light',
  '加油海葵果实':  'water',
  '咕咕帽果实':    'ghost',   // 咕咕帽→咕德帽帽
  // S2 attr 混刷方案使用的果实（补全，防止编辑器显示「部分果实属系未识别」）
  '彩蝶鲨果实':    'water',   // 水系混刷
  '板板壳果实':    'water',   // 水泡壳的游戏内别称（同一精灵）
  '月牙雪熊果实':  'ice',     // 熊狼混刷（S1 精灵，S2 仍可作果实用）
  '乌拉怪果实':    'evil',    // 小夜/小丑豆豆混刷
  '锤头鹳果实':    'wing',    // 翼系
  '奇丽花果实':    'grass',   // 草系混刷
  '蹦跳花果实':    'grass',   // 草系混刷
  '盖武士果实':    'ghost',   // 幽系混刷
  '梦悠悠果实':    'ghost',   // 幽系混刷
  '圣剑-X果实':    'mech',    // 机械系混刷
  '红绒十字果实':  'fire',    // 火系混刷（红绒十字 = 治愈兔同家族）
  '星光狮果实':    'electric',// 电系混刷
  '酷拉果实':      'electric',// 电系混刷
  // S2 新增单果方案果实
  '厉毒修萝果实':  'poison',  // 毒系（厉毒修萝）
  '电企鹅果实':    'ice',     // 冰系（电企鹅）
  '睡睡王果实':    'normal',  // 普通系（睡睡王）
  '梦想三三果实':  'cute',    // 萌系（梦想三三）
  '晶石蜗果实':    'light',   // 光系（晶石蜗）
  // S2 新增双果混刷方案果实
  '缇塔果实':      'mech',    // 机械系混刷（机械方方果+缇塔果）
  '水泡壳果实':    'water',   // 水系混刷（锤头鹳果+水泡壳果）
  '幽星光果实':    'phantom', // 幻系混刷（粉星仔果+幽星光果，幽星光为暮星辰同家族进化前形态）
  '噼啪鸟果实':    'electric',// 电系单果（噼啪鸟电+翼双属，无异色，进电系池出炫光迪迪）
  // S3「铅字幻梦」赛季果实（果实名 = 家族最底形态 + 果实；与 S1 家族严格区分）
  // ── 赛季常驻异色 ──────────────────────────────────────────────────────────
  '海盔虫果实':    'water',   // 千棘盔（水系+毒系，水系为主属）；海盔虫→刺盔虫→千棘盔
  '伊贝儿果实':    'grass',   // 伊贝粉粉（草系）；伊贝儿→伊贝粉粉（2 阶）
  '斑斑果实':      'wing',    // 斑枭（翼系）；斑斑→斑枭（2 阶，与 S1 空空颅家族无关，独立家族）
  '地鼠果实':      'ground',  // 地鼠（地系）；地鼠本身即为家族最底形态
  '可立鸡果实':    'fire',    // 绅士鸡（火系+武系，火系为主属）；可立鸡→晕晕鸡→武者鸡→绅士鸡
  '小草虫果实':    'bug',     // 花衣蝶（虫系+草系，虫系为主属）；小草虫→草衣虫→花衣蝶
  '小鹬果实':      'wing',    // 高脚鹬（翼系）；小鹬→鄙目鹬→高脚鹬
  '豆丁鱼果实':    'water',   // 龙鱼（水系+龙系，水系为主属）；豆丁鱼→快鳍鱼→龙鱼
  // ── 赛季奇遇异色 ──────────────────────────────────────────────────────────
  '蜜果骸果实':    'ghost',   // 幽系+草系（幽系为主属）
  '栗鼠果实':      'poison',  // 壳栗丝鼠；栗鼠→壳栗丝鼠
  '稻草人果实':    'cute',    // 萌系+草系（萌系为主属）
  '蝴蝶陶陶果实':  'cute',    // 蝴蝶陶陶为底形态；蝴蝶陶陶→铆钉毛毛→徘徊爪爪
  '十字蝌蚪果实':  'water',   // 深渊蛙；十字蝌蚪→十字蛙→深渊蛙
  '卡波果实':      'evil',    // 卡拉波斯；卡波→卡拉波斯
  '卡拉果实':      'evil',    // 兼容旧名（卡拉→卡拉波斯 已改为 卡波→卡拉波斯）
  '苞米仔果实':    'grass',   // 草系
  '守夜烛果实':    'fire',    // 火系+机械系（火系为主属）
  // ── 赛季战令异色 ──────────────────────────────────────────────────────────
  '足尖元件果实':  'mech',    // 机械系；足尖元件→离心舞者（战令礼包专属）
  '咬咬小子果实':  'mech',    // 机械系；咬咬小子→胡桃王子（战令礼包专属）
  '离心舞者果实':  'mech',    // 兼容旧名
  '胡桃王子果实':  'mech',    // 兼容旧名
};

// ─── 精灵名 → 属性2 ID 映射（双属性精灵的第2属性，仅用于出货范围判断） ─────────
// 说明：4.23后双属精灵作为主力使用时只计第1属性池进度（贡献规则）；
//       但属性池出货时，第2属性也属于该池的出货范围（出货规则）。
//       因此这张表只用于 classifyResultType 判断「出货」属于哪个池子，
//       不用于计算刷池进度。
export const SPIRIT_ATTR2 = {
  '双灯鱼':   'water',    // 水系+电系（第1电系，第2水系）
  '月牙雪熊': 'phantom',  // 冰系+幻系
  '嗜光嗡嗡': 'light',   // 恶系+光系
  '柴渣虫':   'grass',   // 火系+草系
  '粉粉星':   'phantom',  // 电系+幻系
  '贝瑟':     'fire',    // 机械系+火系
  // 萌系精灵（cute 为第2属性）
  '治愈兔':   'cute',    // 火系+萌系
  '大耳帽兜': 'cute',    // 冰系+萌系
  // S2 双属性精灵
  '恶魔叮':   'wing',    // 恶系+翼系
  '灵狐':     'ice',     // 火系+冰系
  '幽影树':   'grass',   // 幽系+草系
  '音碟吼':   'mech',    // 普通系+机械系
  '烟花伯爵': 'poison',  // 火系+毒系
  '炫光迪迪': 'electric',// 光系+电系
  '加油海葵': 'cute',    // 水系+萌系
  '爆焰喷喷': 'dragon',  // 火系+龙系（战令）
  '噼啪鸟':   'wing',    // 电系+翼系（第2属性翼系）
  // S3 双属性精灵
  '千棘盔':   'poison',  // 水系+毒系
  '绅士鸡':   'fighting',// 火系+武系（S3 新属系）
  '花衣蝶':   'grass',   // 虫系+草系
  '龙鱼':     'dragon',  // 水系+龙系
  '半朽蜜果灵':'grass',  // 幽系+草系
  '稻草守护者':'grass',  // 萌系+草系
  '蝴蝶陶陶': 'poison',  // 萌系+毒系
  '深渊蛙':   'fighting',// 水系+武系（S3 新属系）
  '流明坎德拉':'mech',   // 火系+机械系
  '离心舞者': 'phantom', // 机械系+幻系（战令）
};

// ─── 精灵名 → 属性1 ID 映射（4.23后双属精灵只按属性1计池） ──────────────────
export const SPIRIT_ATTR1 = {
  '治愈兔':   'fire',
  '火红尾':   'fire',
  '柴渣虫':   'fire',
  '呼呼猪':   'ice',
  '大耳帽兜': 'ice',
  '月牙雪熊': 'ice',
  '拉特':     'electric',
  '小星光':   'electric',
  '粉粉星':   'electric',
  '双灯鱼':   'electric',
  '哭哭菇':   'phantom',
  '粉星仔':   'phantom',
  '幽星光':   'phantom', // 幻系（暮星辰同家族的进化前形态，S2 幻系混刷方案 spiritB）
  '暮星辰':   'phantom', // 幻系（幽星光的进化后形态，避免用户改名后误命中「星辰虫」等）
  '格兰种子': 'grass',
  '奇丽草':   'grass',
  '小夜':     'evil',
  '恶魔狼':   'evil',
  '嗜光嗡嗡': 'evil',
  '小灵面':   'ghost',
  '梦悠悠':   'ghost',
  '空空颅':   'ghost',
  '机械方方': 'mech',
  '贝瑟':     'mech',
  '圣剑侍从': 'mech',
  '圣剑-X':   'mech',     // 圣剑侍从进阶形态（S2 机械系混刷果实名）
  '独角兽':   'light',
  '犀角鸟':   'light',
  '疾光千兽': 'light',
  '绒仙子':   'light',
  '绒绒':     'light',
  '火焰猿':   'fire',
  '尖嘴狐仙': 'fire',
  '蹦蹦花':   'grass',
  '波多西':   'mech',
  '深蓝鲸':   'water',
  '菊花梨':   'cute',
  '小独角兽': 'light',
  // S2 赛季常驻异色
  '恶魔叮':   'evil',
  '公平鸽':   'normal',
  '灵狐':     'fire',
  '嘟嘟煲':   'poison',
  '幽影树':   'ghost',
  // S2 赛季奇遇异色
  '小丑公爵': 'evil',
  '小鼓象':   'mech',
  '音碟吼':   'normal',
  '烟花伯爵': 'fire',
  '帅帅魔偶': 'phantom',
  '炫光迪迪': 'light',
  '加油海葵': 'water',
  '咕德帽帽': 'ghost',
  // S2 战令异色
  '雪怪':     'ice',
  '爆焰喷喷': 'fire',
  // S2 attr 单果方案涉及的精灵（spiritA / 池内可出精灵）
  '厉毒修萝': 'poison',
  '电企鹅':   'ice',
  '睡睡王':   'normal',
  '梦想三三': 'cute',
  '晶石蜗':   'light',
  // S2 水系方案涉及的精灵（水系混刷 / 深蓝鲸单果 均可出现）
  '彩蝶鲨':   'water',    // 水系混刷方案（深蓝鲸果+彩蝶鲨果）的池内水系精灵
  // S2 新增方案的果实来源精灵 / 池内可出精灵（之前未录入）
  '星光狮':   'electric', // 电系混刷 / 单果方案果实来源
  '酷拉':     'electric', // 电系混刷果实来源
  '乌拉怪':   'evil',     // 恶系混刷果实来源
  '锤头鹳':   'wing',     // 翼系（锤头鹳家族）
  '盖武士':   'ghost',    // 幽系混刷果实来源
  '红绒十字': 'fire',     // 火系混刷果实来源（治愈兔同家族）
  '奇丽花':   'grass',    // 草系混刷果实来源
  '蹦跳花':   'grass',    // 草系混刷果实来源
  // S2 新增双果混刷方案涉及的精灵
  '缇塔':     'mech',     // 机械系混刷（机械方方果+缇塔果）果实来源
  '水泡壳':   'water',    // 水系混刷（锤头鹳果+水泡壳果）果实来源
  '板板壳':   'water',    // 水泡壳的游戏内别称（同一精灵）
  // 噼啪鸟：电+翼双属，自身无异色，作为庇护所果实使用时污染噼啪鸟应计入电系池
  '噼啪鸟':   'electric', // 电系（第1属性），触发噩梦 → 电系池 +1
  // S3「铅字幻梦」赛季精灵
  // ── 赛季常驻异色 ──────────────────────────────────────────────────────────
  '千棘盔':   'water',    // 水系+毒系（水系为主属）
  '伊贝粉粉': 'grass',    // 草系
  '斑枭':     'wing',     // 翼系
  '地鼠':     'ground',   // 地系（S3 新属系）
  '绅士鸡':   'fire',     // 火系+武系（火系为主属）
  '花衣蝶':   'bug',      // 虫系+草系（虫系为主属，S3 新属系）
  '高脚鹬':   'wing',     // 翼系
  '龙鱼':     'water',    // 水系+龙系（水系为主属）
  // ── 赛季奇遇异色 ──────────────────────────────────────────────────────────
  '半朽蜜果灵':'ghost',   // 幽系+草系（幽系为主属）
  '壳栗丝鼠': 'poison',   // 毒系
  '稻草守护者':'cute',    // 萌系+草系（萌系为主属）
  '蝴蝶陶陶': 'cute',     // 萌系+毒系（萌系为主属）
  '深渊蛙':   'water',    // 水系+武系（水系为主属）
  '卡拉波斯': 'evil',     // 恶系
  '炮米花':   'grass',    // 草系
  '流明坎德拉':'fire',    // 火系+机械系（火系为主属）
  // ── 赛季战令异色 ──────────────────────────────────────────────────────────
  '离心舞者': 'mech',     // 机械系+幻系（机械系为主属，战令礼包专属）
  '胡桃王子': 'mech',     // 机械系（战令礼包专属）
};

// ─── 按属性 ID 获取所有异色精灵 ──────────────────────────────────────────────
export function getShinisByAttr(attrId) {
  const plan = PLANS.find(p => p.id === attrId);
  return plan?.shinies || [];
}

// ─── 根据精灵名找到所有关联方案 ──────────────────────────────────────────────
export function findPlansForSpirit(spiritName) {
  return PLANS.filter(p =>
    (p.shinies && p.shinies.includes(spiritName)) ||
    (p.poolShinies && p.poolShinies.includes(spiritName)) ||
    p.spiritA === spiritName ||
    p.spiritB === spiritName
  );
}

// ─── 所有赛季奇遇精灵（season: true 的方案的 shinies） ────────────────────────
export const SEASON_SHINIES = PLANS
  .filter(p => p.season)
  .flatMap(p => p.shinies)
  .filter((v, i, a) => a.indexOf(v) === i);

// ─── 战令宠异色精灵（需购买战令礼包专属果实单刷，不在常规属性池产出） ─────────
export const BATTLEPASS_SHINIES = PLANS
  .filter(p => p.singleSpirit && p.unlockA?.includes('战令'))
  .flatMap(p => p.shinies)
  .filter((v, i, a) => a.indexOf(v) === i);

// ─── 所有属性异色精灵（属性池方案的 shinies，去重；含战令宠） ─────────────────
export const ATTR_SHINIES = [
  ...PLANS
    .filter(p => !p.season && BASE_IDS.has(p.id) && p.shinies?.length > 0)
    .flatMap(p => p.shinies)
    .filter((v, i, a) => a.indexOf(v) === i && !SEASON_SHINIES.includes(v)),
  ...BATTLEPASS_SHINIES.filter(v => !SEASON_SHINIES.includes(v)),
].filter((v, i, a) => a.indexOf(v) === i);

// ─── 所有可产出异色精灵（去重，含 noShiny 辅助方案） ──────────────────────────
export const ALL_SHINIES = [...new Set(PLANS.flatMap(p => p.shinies))].filter(Boolean);

// ─── 同家族/进化链 精灵名映射表 ──────────────────────────────────────────────
// key：用户可能输入的非异色精灵名（进化前/后形态、别称）
// value：系统内登记的目标异色精灵名（方案 shinies 里的标准名）
export const SPIRIT_FAMILY_MAP = {
  // ── S3 常驻异色进化链 ─────────────────────────────────────────
  '刺盔虫':   '千棘盔',     // 刺盔虫（进化前）→ 千棘盔（S3 水系）
  '海盔虫':   '千棘盔',     // 海盔虫（进化前）→ 千棘盔（S3 水系）
  '千棘海针': '千棘盔',     // 千棘海针（进化中间）→ 千棘盔
  '伊贝儿':   '伊贝粉粉',   // 伊贝儿（进化前）→ 伊贝粉粉（S3 草系）
  '夜枭':     '斑枭',       // 夜枭（进化前）→ 斑枭（S3 翼系）
  '遁鼠':     '地鼠',       // 遁鼠（进化后）→ 目标异色是地鼠（进化前）
  '遁地鼠':   '地鼠',       // 遁地鼠（进化后）→ 目标异色是地鼠（进化前）
  '晕晕鸡':   '绅士鸡',     // 晕晕鸡（进化前）→ 武者鸡 → 绅士鸡（S3 火系）
  '武者鸡':   '绅士鸡',     // 武者鸡（进化中间）→ 绅士鸡
  '化蝶':     '花衣蝶',     // 化蝶（进化前）→ 花衣蝶（S3 虫/草系）
  '小鹬':     '高脚鹬',     // 小鹬（进化前）→ 鄙目鹬 → 高脚鹬（S3 翼系）
  '鄙目鹬':   '高脚鹬',     // 鄙目鹬（进化中间）→ 高脚鹬
  '号儿鱼':   '龙鱼',       // 号儿鱼（进化前）→ 快鳍鱼 → 龙鱼（S3 水系）
  '快鳍鱼':   '龙鱼',       // 快鳍鱼（进化中间）→ 龙鱼
  '卡波':     '卡拉波斯',   // 卡波（进化前）→ 卡拉波斯（S3 恶系）
  '卡拉':     '卡拉波斯',   // 兼容旧名（卡拉→卡拉波斯）
  '苞米仔':   '炮米花',     // 苞米仔（进化前）→ 炮米花（S3 草系）
  '守夜烛':   '流明坎德拉', // 守夜烛（进化前）→ 流明坎德拉（S3 火/机械）
  // ── S3 战令异色进化链 ─────────────────────────────────────────
  '咬咬小子': '胡桃王子',   // 咬咬小子（进化前）→ 胡桃王子（S3 战令）
  '足尖元件': '离心舞者',   // 足尖元件（进化前）→ 离心舞者（S3 战令）
  // ── S2 奇遇精灵进化链 ─────────────────────────────────────────
  '咕咕帽':   '咕德帽帽',   // 咕咕帽 → 咕德帽帽
  '小丑豆豆': '小丑公爵',   // 小丑豆豆 → 小丑兔 → 小丑公爵
  '小丑兔':   '小丑公爵',   // 小丑豆豆 → 小丑兔 → 小丑公爵
  '牵线木偶': '帅帅魔偶',   // 牵线木偶 → 帅帅魔偶
  '加油蟹':   '加油海葵',   // 加油蟹（进化后）→ 目标异色是加油海葵
  '猴麦仔':   '音碟吼',     // 猴麦仔 → 音蝶吼（音碟吼）
  '猴麦':     '音碟吼',     // 猴麦仔的简称
  '音蝶吼':   '音碟吼',     // 写法变体
  '巨鼓象':   '小鼓象',     // 巨鼓象（进化后）→ 目标异色是小鼓象
  // ── S1 / 通用同家族写法 ───────────────────────────────────────
  '可爱猿':   '火焰猿',     // 可爱猿 → 火焰猿
  '尖嘴狐仙': '灵狐',       // 尖嘴狐仙 → 灵狐（同家族果实）
  '白发懒人': '睡睡王',     // 睡睡王的进化前形态
  '瞌睡王':   '睡睡王',     // 同家族写法
  '逗逗':     '梦想三三',   // 逗逗 → 梦想三三
  '矿晶虫':   '晶石蜗',     // 矿晶虫 → 晶石蜗
  '小电企鹅': '电企鹅',     // 小电企鹅 → 电企鹅
  '厉毒小萝': '厉毒修萝',   // 厉毒小萝 → 厉毒修萝
  '绒绒':     '绒仙子',     // 绒绒 → 绒仙子（同家族）
  '犀角鸟':   '疾光千兽',   // 犀角鸟 → 疾光千兽（同家族）
};

/**
 * 将用户输入的精灵名解析到系统目标精灵名。
 * 若命中 SPIRIT_FAMILY_MAP 则返回目标名 + 原始名；否则返回原始名。
 * 返回 { resolved: string, original: string, mapped: boolean }
 */
export function resolveToTargetSpirit(name) {
  if (!name) return { resolved: name, original: name, mapped: false };
  const trimmed = (name || '').trim();
  if (SPIRIT_FAMILY_MAP[trimmed]) {
    return { resolved: SPIRIT_FAMILY_MAP[trimmed], original: trimmed, mapped: true };
  }
  // 模糊查：去掉空格后匹配
  const norm = trimmed.replace(/\s+/g, '');
  for (const [k, v] of Object.entries(SPIRIT_FAMILY_MAP)) {
    if (k.replace(/\s+/g, '') === norm) {
      return { resolved: v, original: trimmed, mapped: true };
    }
  }
  return { resolved: trimmed, original: trimmed, mapped: false };
}

// ─── 通过果实名查询属系 ID ────────────────────────────────────────────────────
export function getFruitAttr(fruitName) {
  return FRUIT_ATTR[fruitName] || null;
}

// ─── 三池出货识别工具 ─────────────────────────────────────────────────────────

/** 规范化精灵名：去空格、去全角/中点，方便容错比较 */
function normalize(s) {
  return (s || '').trim().replace(/\s+/g, '').replace(/[·・•]/g, '');
}

/**
 * 模糊匹配两个中文精灵名（允许 1–2 字错误/多余）
 *  ≤3 字：允许 1 字不同
 *  >3 字：允许 2 字不同
 */
export function fuzzyMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const shorter = na.length <= nb.length ? na : nb;
  const longer  = na.length <= nb.length ? nb : na;
  const matched = [...shorter].filter(ch => longer.includes(ch)).length;
  const missing = shorter.length - matched + Math.abs(na.length - nb.length);
  const maxMiss = shorter.length <= 3 ? 1 : 2;
  return missing <= maxMiss;
}

/** 用模糊匹配在 SPIRIT_ATTR1 里查找精灵的第一属性 id */
function lookupAttr(spiritName) {
  if (!spiritName) return null;
  const nq = normalize(spiritName);
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (normalize(k) === nq) return v;
  }
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  // 兜底：查用户运行时注入的精灵属性（自定义方案 spiritX）
  if (_USER_SPIRIT_ATTR[spiritName]) return _USER_SPIRIT_ATTR[spiritName];
  for (const [k, v] of Object.entries(_USER_SPIRIT_ATTR)) {
    if (normalize(k) === nq) return v;
  }
  for (const [k, v] of Object.entries(_USER_SPIRIT_ATTR)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  return null;
}

/** 用模糊匹配在 SPIRIT_ATTR2 里查找精灵的第二属性 id（用于出货池判断） */
function lookupAttr2(spiritName) {
  if (!spiritName) return null;
  const nq = normalize(spiritName);
  for (const [k, v] of Object.entries(SPIRIT_ATTR2)) {
    if (normalize(k) === nq) return v;
  }
  for (const [k, v] of Object.entries(SPIRIT_ATTR2)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  return null;
}

/** 从方案对象中推断属性 id */
export function getPlanAttrId(plan) {
  if (!plan) return null;
  const ALL_BASE = new Set([
    'fire','ice','electric','phantom','grass','evil','ghost','mech','light','water','cute','normal','poison',
    'ground','bug','fighting','dragon', // S3 新增属系
    'wing',                             // 翼系（已有）
  ]);
  if (ALL_BASE.has(plan.id)) return plan.id;
  if (plan.attrId && ALL_BASE.has(plan.attrId)) return plan.attrId;
  const m = (plan.iconImg || '').match(/attrs\/(\w+)\.png/);
  if (m) return m[1];
  // 兜底：从方案的果实属性推导（适用于自定义方案没有 attrId/iconImg 的情况）
  // 只有单属性（同属果实）方案才能明确归入某个系别池
  const { isSameAttr, fruitAttrId } = analyzePlanFruits(plan);
  if (isSameAttr && fruitAttrId && ALL_BASE.has(fruitAttrId)) return fruitAttrId;
  return null;
}

/**
 * analyzePlanFruits(plan)
 * 根据方案的果实组合分析刷取模式：
 *   - 果实数：只有1种果实 → 单刷；多种果实 → 混刷
 *   - 同属判断：所有果实属于同一属系 → isSameAttr = true
 * 返回：{ isSingleFruit, isSameAttr, fruitAttrId }
 *   fruitAttrId：同属时的属性 ID（跨属则为 null）
 *
 * 注：优先读 plan.fruits[]（支持 3+ 果实自定义方案），兼容旧 fruitA/fruitB/fruitC 字段
 * 兜底：FRUIT_ATTR 查不到时（自定义方案果实名不在内置字典里），
 *       读 plan.attrA / plan.attrB——这是 buildPlan() 用 getAttrByAnyName() 推导好并存入的正确属性。
 */
export function analyzePlanFruits(plan) {
  if (!plan) return { isSingleFruit: true, isSameAttr: false, fruitAttrId: null };
  // getPlanFruitsArray 已优先读 plan.fruits[]，兼容旧字段，支持任意数量果实
  const fruitEntries = getPlanFruitsArray(plan).filter(f => f && f.fruit);
  const isSingleFruit = fruitEntries.length <= 1;
  // 属性识别优先级：
  //   1. 内置 FRUIT_ATTR 字典（精准）
  //   2. 果实条目自带的 attr 字段（PlanEditor / buildPlan 保存时写入，支持 N 个果实）
  //   3. 旧字段兜底：plan.attrA / plan.attrB（仅兼容 CustomChecklist 旧方案）
  const LEGACY_ATTR = [plan.attrA, plan.attrB];
  const fruitAttrs = [...new Set(fruitEntries.map((f, i) => {
    // 优先内置字典
    const fromDict = FRUIT_ATTR[f.fruit];
    if (fromDict) return fromDict;
    // 次选：条目本身的 attr 字段（新方案由 PlanEditor/buildPlan 写入）
    if (f.attr) return f.attr;
    // 兜底：旧字段（CustomChecklist 老路径，最多 2 个）
    if (LEGACY_ATTR[i]) return LEGACY_ATTR[i];
    return null;
  }).filter(Boolean))];
  const isSameAttr = fruitAttrs.length === 1;
  const fruitAttrId = isSameAttr ? fruitAttrs[0] : null;
  return { isSingleFruit, isSameAttr, fruitAttrId };
}

/**
 * 判断出货/污染精灵属于哪个池子：
 *   'family' — 家族池：同时满足以下三个条件
 *                1. 只使用了 1 种果实（单刷）
 *                2. 产出精灵与果实对应精灵相同（spiritA 或 spiritB，可扩展至 C/D）
 *                3. 产出精灵已在 ALL_SHINIES 中登记（即该精灵在游戏中确实有异色版本）
 *              例：恶魔狼果实 → 小夜，不是家族池（恶魔狼自身无异色，不在 ALL_SHINIES）
 *   'attr'   — 属性池：精灵属性与果实属性匹配（单果实非家族 / 同属混刷）
 *   'world'  — 世界池：跨属混刷；或属性不匹配
 *
 * 规则（按果实来判断，而非 category）：
 *   1. 只有1种果实（单刷）：
 *      a. 产出精灵 = spiritA/B 且在 ALL_SHINIES → family
 *      b. 其他：按精灵属性 vs 果实属性判断
 *         - 属性匹配（含第2属性）→ attr
 *         - 自定义方案且精灵属性字典查不到 → attr（信任方案属系声明）
 *         - 属性不匹配 → world
 *   2. 多种果实且全部同属性（同属混刷）：无家族池
 *      - 内置精灵（SPIRIT_ATTR1 可查到）：同属 → attr，不同属 → world
 *      - 自定义精灵（字典查不到属性）：直接归 attr
 *   3. 多种果实且跨属性（跨属混刷）：全部 → world
 *
 * 属性池出货范围说明（官方规则）：
 *   当某属性池触发出货时，该属性下所有精灵（包括第2属性属于该系的精灵）
 *   均有概率出现。因此判断时同时检查出货精灵的第1属性 AND 第2属性。
 *   例：萌系池出货 → 治愈兔（火+萌）或大耳帽兜（冰+萌）均算属性池出货。
 */
export function classifyResultType(resultSpirit, plan) {
  if (!resultSpirit || !plan) return 'world';
  // 果冻/星辰虫：固定归世界池，不参与三池推断（字典查不到属性会命中自定义兜底逻辑，必须前置排除）
  if (resultSpirit === '果冻/星辰虫') return 'world';
  const { isSingleFruit, isSameAttr, fruitAttrId } = analyzePlanFruits(plan);

  if (isSingleFruit) {
    // 家族池判断，三个条件必须同时满足：
    //   条件1：产出精灵在 ALL_SHINIES 中（该精灵在游戏里有异色版本）
    //   条件2：产出精灵 = 本方案的果实精灵（spiritA 或 spiritB）
    //   条件3：该方案的 shinies 列表中也包含该精灵（即该方案确实能产出此异色）
    //
    // 条件3 是关键修复点：
    //   - S2「恶系方案2」spiritA=恶魔狼，但 shinies=['小夜','小丑公爵']（恶魔狼在S2无异色）
    //   - 若只用条件1+2，恶魔狼在 ALL_SHINIES（S1有异色）+ spiritA 匹配 → 会误判为家族池
    //   - 加上条件3：shinies 不包含恶魔狼 → 正确排除家族池，归属系池
    const inAllShinies = ALL_SHINIES.includes(resultSpirit)
      || ALL_SHINIES.some(k => fuzzyMatch(k, resultSpirit));
    if (inAllShinies) {
      const targetFamilies = [plan.spiritA, plan.spiritB].filter(Boolean);
      const matchesFamilySpirit = targetFamilies.some(t => fuzzyMatch(t, resultSpirit));
      // 条件3：方案的 shinies 列表包含该精灵（该方案本赛季能产出此异色）
      const inPlanShinies = !plan.shinies?.length
        || plan.shinies.some(s => fuzzyMatch(s, resultSpirit) || fuzzyMatch(resultSpirit, s));
      if (matchesFamilySpirit && inPlanShinies) return 'family';
    }

    // 非家族池：按精灵属性 vs 果实属性判断属系池 / 世界池
    if (fruitAttrId) {
      const spiritAttr1 = lookupAttr(resultSpirit);
      const spiritAttr2 = lookupAttr2(resultSpirit);
      if (spiritAttr1 === fruitAttrId || spiritAttr2 === fruitAttrId) return 'attr';
      // 自定义方案 + 自定义精灵（字典查不到属性）：
      // 方案已通过 fruits[].attr 明确声明了属系，且精灵名无法从字典反查，
      // 此时信任方案的属系声明，归入属系池
      if (plan.custom && !spiritAttr1 && !spiritAttr2) return 'attr';
    }
    return 'world';
  }

  if (isSameAttr && fruitAttrId) {
    // 同属混刷：没有家族池
    const spiritAttr1 = lookupAttr(resultSpirit);
    const spiritAttr2 = lookupAttr2(resultSpirit);
    // 内置精灵：按属性精确判断
    if (spiritAttr1 === fruitAttrId || spiritAttr2 === fruitAttrId) return 'attr';
    // 自定义精灵（字典查不到属性）：方案已声明属系，直接归属系池
    if (!spiritAttr1 && !spiritAttr2) return 'attr';
    // 内置精灵但属性不匹配：归世界池
    return 'world';
  }

  // 跨属混刷：全部归世界池
  return 'world';
}

/**
 * 兼容旧数据：从 task + plan 推断池子类型
 */
export function inferPoolType(task, plan) {
  if (!task) return 'world';
  // 优先从 resultSpirit + plan 重新推断：
  //   - 覆盖旧数据中同属混刷方案错误存成 'family' 的情况
  //   - 覆盖旧数据中缺少双属性判断而错存成 'world' 的情况
  //   - 单刷方案重推结果不变，无副作用
  if (task.resultSpirit && plan) {
    return classifyResultType(task.resultSpirit, plan);
  }
  // 无精灵名时降级信任存储值，旧格式 'pool' 兜底为 family
  if (task.resultType === 'family' || task.resultType === 'attr') return task.resultType;
  return task.resultType === 'pool' ? 'family' : 'world';
}

/** 池子类型的展示配置 */
export const POOL_TYPE_CONFIG = {
  family: { label: '家族池出货', bg: '#2B2A2E', color: '#FBF7EC', tagBg: '#F0E8D5', tagColor: '#C8830A', tagBorder: '#C8A020' },
  attr:   { label: '属性池出货', bg: '#E8A020', color: '#fff',    tagBg: '#FFF3CC', tagColor: '#C8830A', tagBorder: '#C8A020' },
  world:  { label: '世界池出货', bg: '#7E57C2', color: '#fff',    tagBg: '#F5E8FF', tagColor: '#8B4BB8', tagBorder: 'rgba(139,75,184,0.3)' },
  manual: { label: '手动补录',   bg: '#607D8B', color: '#fff',    tagBg: '#F0F4F8', tagColor: '#607D8B', tagBorder: 'rgba(96,125,139,0.3)' },
  // 旧值兜底
  pool:    { label: '方案出货',  bg: '#2B2A2E', color: '#FBF7EC', tagBg: '#F0E8D5', tagColor: '#C8830A', tagBorder: '#C8A020' },
  offpool: { label: '歪池出货',  bg: '#7E57C2', color: '#fff',    tagBg: '#F5E8FF', tagColor: '#8B4BB8', tagBorder: 'rgba(139,75,184,0.3)' },
};

// ─── 特殊形态数据 ─────────────────────────────────────────────────────────────
export const SPECIAL_FORMS = [
  {
    planIds: ['electric'],
    spirit: '小星光',
    fruitImg: '小星光果实',
    hiddenForm: '月光能量星光狮',
    sanctuary: '聆风塔地底护所',
    acornDesc: '小星光的橡果形态（黄色星形图案）',
  },
  {
    spirit: '小狮鹫',
    fruitImg: '小狮鹫果实',
    hiddenForm: '高山地皇家狮鹫',
    sanctuary: '学院驻地底护所',
    acornDesc: '高山地样子的果实形态（绿色山形图案）',
    planIds: [],
  },
  {
    spirit: '地鼠',
    fruitImg: '地鼠果实',
    hiddenForm: '储水期地鼠',
    sanctuary: '德雷克福德庄园底护所',
    acornDesc: '储水时样子的果实形态（黄色水滴/心形图案）',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    fruitImg: '蹦蹦种子果实',
    hiddenForm: '短毛球形态',
    sanctuary: '独角兽领地底护所',
    acornDesc: '短毛球果实（绿色带黑斑足球纹）',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    fruitImg: '蹦蹦种子果实',
    hiddenForm: '象牙球形态',
    sanctuary: '采邑地底护所',
    acornDesc: '象牙球果实（绿色带白花足球纹）',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    fruitImg: '蹦蹦种子果实',
    hiddenForm: '彩玉球形态',
    sanctuary: '挽风屏障底护所',
    acornDesc: '彩玉球果实（绿色带紫花足球纹）',
    planIds: [],
  },
];

// ─── 属性 ID → 咕噜球图标映射 ─────────────────────────────────────────────────
// 球→属性对照（来自游戏内百科）：
//   美妙球  = 萌系/普通系/水系/翼系（水兜球在本项目无素材，暂用美妙球兜底）
//   调温球  = 冰系/火系
//   变幻球  = 幻系/机械系（机械系实际用变幻球）
//   光合球  = 草系/光系
//   淘沙球  = 地系/虫系（电系精灵用淘沙球，此处映射 electric → 淘沙球）
//   好战球  = 龙系/武系
//   绝缘球  = 毒系/电系 → 此处 electric / poison 用绝缘球
//   暗星球  = 恶系/幽系
//   高级球  = 赛季/稀有（捕获赛季精灵时常用）
//   网兜球  = 水系（专属捕水系精灵）
// 注：electric 在洛克王国中使用绝缘球，mech 使用变幻球
export const ATTR_BALL_MAP = {
  fire:     { file: 'ball-temp.png',    label: '调温球' },
  ice:      { file: 'ball-temp.png',    label: '调温球' },
  electric: { file: 'ball-elec.png',   label: '绝缘球' },
  phantom:  { file: 'ball-phantom.png', label: '变幻球' },
  grass:    { file: 'ball-grass.png',   label: '光合球' },
  light:    { file: 'ball-grass.png',   label: '光合球' },
  evil:     { file: 'ball-dark.png',    label: '暗星球' },
  ghost:    { file: 'ball-dark.png',    label: '暗星球' },
  mech:     { file: 'ball-phantom.png', label: '变幻球' },
  water:    { file: 'ball-net.png',     label: '网兜球' },
  cute:     { file: 'ball-cute.png',    label: '美妙球' },
  // 兜底
  normal:   { file: 'ball-cute.png',    label: '美妙球' },
  dragon:   { file: 'ball-fight.png',   label: '好战球' },
  fight:    { file: 'ball-fight.png',   label: '好战球' },
  earth:    { file: 'ball-earth.png',   label: '淘沙球' },
  bug:      { file: 'ball-earth.png',   label: '淘沙球' },
  wing:     { file: 'ball-cute.png',    label: '美妙球' },
  poison:   { file: 'ball-elec.png',   label: '绝缘球' },
};

/**
 * 根据精灵名获取对应的咕噜球信息
 * @param {string} spiritName
 * @returns {{ file: string, label: string } | null}
 */
export function getBallBySpirit(spiritName) {
  const attrId = SPIRIT_ATTR1[spiritName];
  if (!attrId) return null;
  return ATTR_BALL_MAP[attrId] || null;
}

/**
 * 根据方案（plan）获取对应属性球信息。
 * 属性球应跟随「用户全程在抓的果实精灵（spiritA）」的属性，
 * 而非出货精灵的属性。
 * 例：菊花梨方案（cute 系）→ 美妙球，即便出货的是治愈兔（fire 系）。
 * @param {object} plan
 * @returns {{ file: string, label: string } | null}
 */
export function getBallByPlan(plan) {
  if (!plan) return null;
  // 优先用 spiritA 的属性，fallback 到 spiritB
  const attrId = SPIRIT_ATTR1[plan.spiritA] || SPIRIT_ATTR1[plan.spiritB] || null;
  if (!attrId) return null;
  return ATTR_BALL_MAP[attrId] || null;
}

/** 根据精灵名返回属系 id（用于 attrs/{id}.png） */
export function getAttrIdBySpirit(spiritName) {
  return SPIRIT_ATTR1[spiritName] || null;
}

// ─── store.jsx 依赖的导出函数 ──────────────────────────────────────────────────

/**
 * classifyPool(spiritName, plan)
 * 判断破盾出现的精灵属于哪个池子（与 classifyResultType 等价，别名导出）：
 *   'family' — 家族池（plan 的 spiritA / spiritB 同族，70次保底）
 *   'attr'   — 属性池（同属性非家族精灵，80次保底）
 *   'world'  — 世界池（其他，80次保底）
 */
export function classifyPool(spiritName, plan) {
  return classifyResultType(spiritName, plan);
}

/**
 * resolveShinyKey(spiritName)
 * 将用户填写的精灵名归一化为图鉴中的「代表异色名」。
 * 若 spiritName 本身就是图鉴 key（PLANS 的 shinies 中存在），直接返回。
 * 若为同家族的进化前/后形态，则找到包含该精灵的方案后返回其 shinies[0]。
 * 找不到则返回原名（让调用方按原名处理）。
 */
export function resolveShinyKey(spiritName) {
  if (!spiritName) return spiritName;
  // 1. 所有图鉴 key 集合：PLANS 中所有 shinies 的并集
  const allKeys = new Set(ALL_SHINIES);
  // 精确命中：本身就是图鉴 key
  if (allKeys.has(spiritName)) return spiritName;
  // 2. 模糊匹配：遍历所有 shinies，找到 fuzzyMatch 的第一个
  for (const key of allKeys) {
    if (fuzzyMatch(key, spiritName)) return key;
  }
  // 3. 没有找到：返回原名（调用方按原名处理，图鉴不会误点亮）
  return spiritName;
}

/**
 * computePoolCounts(activeTasks, completedTasks, allPlans, season?)
 * 从任务事件流（shieldBreaks）派生三池当前保底计数。
 *
 * ── 截断点机制 ──────────────────────────────────────────────────────────────
 * 每次某池出货，该池就从那个时间点（completedAt）重新归零开始计数。
 * 实现方式：
 *   1. 先扫描 completedTasks，找各池最近一次出货的 completedAt 作为「截断点」
 *      - worldCutoff：最近一次世界池出货的 completedAt（全局唯一）
 *      - attrCutoffByAttr[attrId]：最近一次该属性池出货的 completedAt（按属性分桶）
 *      注意：hasContinuation 任务（COMPLETE_AND_CONTINUE 产生）的 completedAt
 *            也参与截断点计算（该池确实在那时出货了），但其 breaks 被跳过（已转移到 activeTask）。
 *   2. 统计所有 breaks（activeTasks + completedTasks）时，按 break.time 与截断点比较：
 *      - break.time ≤ cutoff → 跳过（截断点之前的进度已被清零）
 *      - break.time > cutoff  → 计入（截断点之后的新进度）
 *   3. hasContinuation 任务：其 breaks 已全部转移到 activeTask，
 *      遍历 completedTasks 时跳过其 breaks，避免重复计数。
 *
 * ── 赛季隔离 ────────────────────────────────────────────────────────────────
 * 传入 season 时，只统计同赛季的 completedTasks（截断点和 break 计数均限赛季内）。
 *
 * ── 家族池 ──────────────────────────────────────────────────────────────────
 * 家族池绑定单个 task，出货后由 COMPLETE_AND_CONTINUE 过滤 breaks 清零，不走截断点机制。
 * 多个进行中 task 并行时取最大值。
 *
 * ── Jelly（果冻/星辰虫）────────────────────────────────────────────────────
 * jelly 固定 pool='world'，计入世界池保底（也占 shieldBreakCount 序号，是真实破盾事件），
 * 跟随 worldCutoff 截断点规则。
 *
 * @param {string} [season] - 当前赛季（'S1'|'S2'）
 * 返回：{ family: number, attrPools: { [attrId]: number }, worldPool: number }
 */
// 解析任务的有效赛季：优先读方案的 season，兜底读 task.season。
// 与 Home.jsx resolveTaskSeason 逻辑保持一致。
// export 供 Profile.jsx 等页面直接使用，确保所有地方口径统一。
export function resolveTaskSeasonFromPlans(task, allPlans) {
  const plan = (allPlans || []).find(p => p.id === task.planId);
  if (plan?.season) return plan.season;
  return task.season || null;
}

// 各赛季开始日期（用于无 season 字段时按完成时间判断归属）
const S2_START_DATE = SEASONS.S2.startDate; // '2026-05-15'
// S3 上线时取消注释：const S3_START_DATE = SEASONS.S3.startDate;

export function computePoolCounts(activeTasks, completedTasks, allPlans, season) {
  // 赛季过滤：只保留同赛季的已完成任务
  // 用方案的 season 优先，避免 task.season 历史写错（如 S2 方案但 task.season='S1'）
  const relevantCompleted = (completedTasks || []).filter(t => {
    if (!t || t.resultType === 'abandoned') return false;
    if (season) {
      const effectiveSeason = resolveTaskSeasonFromPlans(t, allPlans);
      if (effectiveSeason) {
        // 能识别出赛季 → 直接比较
        if (effectiveSeason !== season) return false;
      } else {
        // 无法识别赛季（自定义方案无 season 字段，且 task.season 也为空）
        // → 按 completedAt 时间判断：S2 期间归 S2，其余归 S1
        // S3 上线时加回：(S3_START_DATE && t.completedAt && t.completedAt >= S3_START_DATE) ? 'S3' :
        const resolvedSeason = (t.completedAt && t.completedAt >= S2_START_DATE) ? 'S2' : 'S1';
        if (resolvedSeason !== season) return false;
      }
    }
    return true;
  });

  // ── 阶段 1：建立各池截断点 ──────────────────────────────────────────────
  // hasContinuation 任务的 completedAt 也参与截断点计算（该池确实在那时出货）
  let worldCutoff = null;                // 最近一次世界池出货时间（ISO 字符串）
  const attrCutoffByAttr = {};          // { [attrId]: ISO 字符串 }
  relevantCompleted.forEach(task => {
    const plan = allPlans.find(p => p.id === task.planId);
    const planAttrId = getPlanAttrId(plan);
    const outPool = task.resultType; // 'family' | 'attr' | 'world'
    if (outPool === 'world') {
      if (!worldCutoff || task.completedAt > worldCutoff) worldCutoff = task.completedAt;
    } else if (outPool === 'attr' && planAttrId) {
      if (!attrCutoffByAttr[planAttrId] || task.completedAt > attrCutoffByAttr[planAttrId]) {
        attrCutoffByAttr[planAttrId] = task.completedAt;
      }
    }
    // family 池：绑定 task 内部，出货由 COMPLETE_AND_CONTINUE 的 filter 清零，不建全局截断点
  });

  // ── 阶段 2：计数 breaks ──────────────────────────────────────────────────
  const attrPools = {}; // { [attrId]: number }
  let worldPool = 0;
  let familyMax = 0;

  /**
   * 统计单条 break，按截断点决定是否计入。
   * onFamily: 家族池命中时的回调（null 则忽略家族 break）
   */
  const countBreak = (br, plan, planAttrId, onFamily) => {
    // shiny（出货事件本身）和 failed（失败/逃跑）不计入任何保底池
    if (br.result === 'shiny' || br.result === 'failed') return;
    // 推断池归属：有 spiritName 时总是实时重推（忽略存量 pool 字段）
    // 原因：classifyResultType 的判断逻辑可能因需求变化而升级（如增加条件3），
    //       存量 pool 字段可能基于旧逻辑写入了错误值（如恶系方案2旧记录 pool='family'），
    //       总是实时重推确保计算结果与最新逻辑一致，与 computeFamilyPool 保持一致。
    const pool = br.result === 'jelly'
      ? 'world'  // 果冻/星辰虫：固定归世界池，不走 classifyResultType
      : (br.spiritName ? classifyResultType(br.spiritName, plan) : (br.pool || 'world'));
    if (pool === 'family') {
      if (onFamily) onFamily();
    } else if (pool === 'attr') {
      const cutoff = planAttrId ? attrCutoffByAttr[planAttrId] : null;
      // break.time 早于截断点 → 已被清零，跳过；无截断点或晚于截断点 → 计入
      if (!cutoff || !br.time || br.time > cutoff) {
        if (planAttrId) {
          attrPools[planAttrId] = (attrPools[planAttrId] || 0) + 1;
        } else {
          // 无法识别属性时归入世界池（兜底），同时应用世界池截断点
          // 避免自定义方案 attrId 缺失时，属系 break 绕过 worldCutoff 虚高世界池
          if (!worldCutoff || !br.time || br.time > worldCutoff) worldPool++;
        }
      }
    } else { // 'world'（含 jelly，jelly 的 pool 固定为 'world'）
      if (!worldCutoff || !br.time || br.time > worldCutoff) worldPool++;
    }
  };

  // 进行中的任务（仅统计当前赛季，防止跨赛季污染）
  // 用方案的 season 优先于 task.season，避免历史数据写错导致任务被误过滤
  (activeTasks || []).filter(t => {
    if (!season) return true;
    const effectiveSeason = resolveTaskSeasonFromPlans(t, allPlans);
    // 无法识别赛季的任务/方案统一归入当前默认赛季 S2（S3 上线后改为 'S3'）
    const resolvedSeason = effectiveSeason || 'S2';
    return resolvedSeason === season;
  }).forEach(task => {
    const plan = allPlans.find(p => p.id === task.planId);
    const planAttrId = getPlanAttrId(plan);
    // task.startTime 是本轮开始时间（COMPLETE_AND_CONTINUE 每次继续刷都会重置）。
    // 「继续刷取」保留全量 shieldBreaks，startTime 之前的旧 breaks 属于上一轮已出货的轮次，
    // 不应再计入全局保底进度（否则家族池出货继续刷后，attr/world 旧进度会被重复计入）。
    const taskStart = task.startTime || null;
    let familyCount = 0;
    (task.shieldBreaks || []).forEach(br => {
      // 早于本轮开始时间的旧 break 跳过（仅影响「继续刷」场景，首次任务无历史 break）
      if (taskStart && br.time && br.time < taskStart) return;
      countBreak(br, plan, planAttrId, () => familyCount++);
    });
    if (familyCount > familyMax) familyMax = familyCount;
  });

  // 已完成的任务
  relevantCompleted.forEach(task => {
    // hasContinuation：breaks 已转移到 activeTask，跳过避免重复计数
    // （其 completedAt 已在阶段 1 作为截断点参与了计算）
    if (task.hasContinuation) return;
    const plan = allPlans.find(p => p.id === task.planId);
    const planAttrId = getPlanAttrId(plan);
    (task.shieldBreaks || []).forEach(br => {
      // 家族 breaks 属于 task 内部（已出货清零），完成后不再计入全局，传 null 忽略
      countBreak(br, plan, planAttrId, null);
    });
  });

  return { family: familyMax, attrPools, worldPool };
}

/**
 * getFruitBySpirit(spiritName)
 * 通过精灵名反查对应的果实名。
 * 策略：在 FRUIT_ATTR 中找到以 spiritName 开头且以"果实"结尾的 key。
 * 例：'治愈兔' → '治愈兔果实'，'小独角兽' → '小独角兽果实'。
 * 找不到则返回 null。
 */
export function getFruitBySpirit(spiritName) {
  if (!spiritName) return null;
  // 1. 精确匹配：spiritName + '果实'
  const exact = `${spiritName}果实`;
  if (FRUIT_ATTR[exact] !== undefined) return exact;
  // 2. 模糊匹配：FRUIT_ATTR 中 key 包含 spiritName 的（如昵称/别名）
  for (const key of Object.keys(FRUIT_ATTR)) {
    if (key.includes(spiritName)) return key;
  }
  return null;
}

/**
 * getAllSpiritFruitPairs()
 * 返回所有「精灵名 ↔ 果实名」的对照数组，每条形如 { spirit, fruit }。
 * 数据来源：FRUIT_ATTR（遍历 key，去掉"果实"后缀得到精灵名），去重后返回。
 */
export function getAllSpiritFruitPairs() {
  const result = [];
  const seen = new Set();
  for (const fruitName of Object.keys(FRUIT_ATTR)) {
    if (!fruitName.endsWith('果实')) continue;
    const spiritName = fruitName.slice(0, -2); // 去掉"果实"
    if (seen.has(spiritName)) continue;
    seen.add(spiritName);
    result.push({ spirit: spiritName, fruit: fruitName });
  }
  return result;
}

/**
 * getAttrByAnyName(name)
 * 通过果实名或精灵名反查属系 ID。
 * 先查 FRUIT_ATTR（果实名映射），再查 SPIRIT_ATTR1（精灵名映射），找不到返回 null。
 */
export function getAttrByAnyName(name) {
  if (!name) return null;
  if (FRUIT_ATTR[name]) return FRUIT_ATTR[name];
  if (SPIRIT_ATTR1[name]) return SPIRIT_ATTR1[name];
  return null;
}

/**
 * computeFamilyPool(task, plan)
 * 统计当前 task 的家族池保底计数：
 * 遍历 task.shieldBreaks，排除 jelly 类型，
 * 将 pool 字段缺失的记录用 classifyResultType 推断，
 * 返回属于 'family' 的次数。
 */
export function computeFamilyPool(task, plan) {
  if (!task) return 0;
  const rawCount = (task.shieldBreaks || []).filter(br => {
    if (br.result === 'jelly') return false;
    // 有 spiritName 时总是实时重新推断（忽略存量 pool 字段，修复存量数据误判问题）
    const pool = br.spiritName ? classifyResultType(br.spiritName, plan) : (br.pool || 'world');
    return pool === 'family';
  }).length;
  // 减去「继续刷」时家族池出货归零的 offset（breaks 全量保留，通过减法让进度正确归零）
  const offset = task.poolBreakOffsets?.family || 0;
  return Math.max(0, rawCount - offset);
}

/**
 * getPlanMainPool(plan)
 * 返回方案的主池类型（基于果实分析，而非 category 字段）：
 *   'family' — 单刷（只有1种果实）
 *   'attr'   — 同属混刷（多种果实且全部同属性）
 *   'world'  — 跨属混刷（多种果实但跨属性）
 *
 * 对于自定义方案（无 fruitA 等字段），降级使用 category / singleSpirit / attrId 推断。
 */
export function getPlanMainPool(plan) {
  if (!plan) return 'world';
  // 用户主动勾选「混池」时强制走世界池
  if (plan.forceWorld) return 'world';
  // 优先用果实数据判断（优先读 plan.fruits[]，支持 3+ 果实方案）
  const fruitNames = getPlanFruitsArray(plan).map(f => f.fruit).filter(Boolean);
  if (fruitNames.length > 0) {
    const { isSingleFruit, isSameAttr, fruitAttrId } = analyzePlanFruits(plan);
    if (isSingleFruit) return 'family';
    if (isSameAttr && fruitAttrId) return 'attr';
    return 'world';
  }
  // 降级：自定义方案没有 fruitA 字段时，按旧逻辑推断
  if (plan.category === 'seasonal' || plan.category === 'single' || plan.singleSpirit) return 'family';
  if (getPlanAttrId(plan)) return 'attr';
  return 'world';
}

/**
 * resolvePlanIconImg(plan, attrBase)
 * 推导方案的图标路径：
 *   优先用 plan.iconImg，其次继承 attrBase.iconImg，都没有则返回 null。
 */
export function resolvePlanIconImg(plan, attrBase) {
  if (!plan) return null;
  if (plan.iconImg) return plan.iconImg;
  if (attrBase?.iconImg) return attrBase.iconImg;
  return null;
}

// ─── 赛季推断：根据精灵名 / 方案 shinies 推断赛季归属 ──────────────────────────
// S2 精灵集合（从各赛季 PLANS 的 shinies 提取，运行时一次性构建）
const S2_SPIRIT_SET = new Set(S2_PLANS.flatMap(p => p.shinies || []));
// S3 上线时取消注释：const S3_SPIRIT_SET = new Set(S3_PLANS.flatMap(p => p.shinies || []));

/**
 * 推断单只精灵的赛季归属。
 * 命中 S2_SPIRIT_SET → 'S2'；否则 → 'S1'。
 * S3 上线时加回：命中 S3_SPIRIT_SET → 'S3'
 * 无法识别（空名）→ null。
 */
export function inferSpiritSeason(spiritName) {
  if (!spiritName) return null;
  const name = spiritName.trim();
  // S3 上线时加回：if (S3_SPIRIT_SET.has(name)) return 'S3';
  if (S2_SPIRIT_SET.has(name)) return 'S2';
  return 'S1';
}

/**
 * 推断方案的赛季归属（用于存量迁移 / 方案卡片展示）。
 * 策略：对方案 shinies 逐一判断，S2 数量 > 半数 → 'S2'；否则 → 'S1'。
 * S3 上线时加回 S3 判断逻辑。
 * 无 shinies 或 shinies 为空数组 → null（不强制标记，让用户手动选）。
 */
export function inferPlanSeason(plan) {
  const shinies = plan?.shinies;
  if (!shinies || shinies.length === 0) return null;
  // S3 上线时加回：const s3Count = shinies.filter(n => S3_SPIRIT_SET.has(n)).length;
  const s2Count = shinies.filter(n => S2_SPIRIT_SET.has(n)).length;
  // S3 上线时加回：if (s3Count > shinies.length / 2) return 'S3';
  if (s2Count > shinies.length / 2) return 'S2';
  return 'S1';
}

// ─── 存量精灵名模糊纠偏 ───────────────────────────────────────────────────────
// 候选精灵名：SPIRIT_ATTR1 所有键（含属性精灵）+ ALL_SHINIES（含出货精灵），去重合并
// _FUZZY_SPIRIT_POOL 使用 Set 管理，支持运行时动态注入用户自定义精灵名
const _FUZZY_POOL_SET = new Set();
const _FUZZY_SPIRIT_POOL = [];     // 保持数组形式供 fuzzyResolveSpiritName 遍历

// 运行时扩展的 SPIRIT_ATTR1 副本（不污染原静态对象）
const _USER_SPIRIT_ATTR = {};      // { spiritName: attrId }

// 初始化：把静态数据写入可扩展池
;(() => {
  const addName = n => {
    if (n && !_FUZZY_POOL_SET.has(n)) { _FUZZY_POOL_SET.add(n); _FUZZY_SPIRIT_POOL.push(n); }
  };
  Object.keys(SPIRIT_ATTR1).forEach(addName);
  ALL_SHINIES.forEach(addName);
})();

/**
 * 运行时注入用户自定义精灵（名称 + 属性）到模糊纠偏候选池。
 * 调用时机：userPlanConfig 初始化或变化时（由 StoreProvider 的 useEffect 触发）。
 * 幂等：已存在于静态 SPIRIT_ATTR1 的精灵不会被用户数据覆盖；重复注入同名精灵安全。
 *
 * @param {Array<{ name: string, attrId?: string }>} entries
 */
export function registerUserSpirits(entries) {
  if (!Array.isArray(entries)) return;
  entries.forEach(({ name, attrId }) => {
    if (!name) return;
    // 加入模糊纠偏候选池（去重）
    if (!_FUZZY_POOL_SET.has(name)) {
      _FUZZY_POOL_SET.add(name);
      _FUZZY_SPIRIT_POOL.push(name);
    }
    // 注入属性（不覆盖内置 SPIRIT_ATTR1 的精灵属性）
    if (attrId && !Object.prototype.hasOwnProperty.call(SPIRIT_ATTR1, name)) {
      _USER_SPIRIT_ATTR[name] = attrId;
    }
  });
}

/**
 * 运行时查询精灵属性（内置 + 用户注入，优先内置）
 * 供 classifyPool / lookupAttr 等函数使用的统一入口。
 */
export function lookupAttrRuntime(spiritName) {
  if (!spiritName) return null;
  // 先精确匹配内置
  if (SPIRIT_ATTR1[spiritName]) return SPIRIT_ATTR1[spiritName];
  // 再精确匹配用户注入
  if (_USER_SPIRIT_ATTR[spiritName]) return _USER_SPIRIT_ATTR[spiritName];
  // 模糊匹配内置
  const nq = normalize(spiritName);
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (normalize(k) === nq) return v;
  }
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  // 模糊匹配用户注入
  for (const [k, v] of Object.entries(_USER_SPIRIT_ATTR)) {
    if (normalize(k) === nq) return v;
  }
  for (const [k, v] of Object.entries(_USER_SPIRIT_ATTR)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  return null;
}

/**
 * 同位置字符匹配得分（0 ~ min(a.len, b.len)），得分越高越相似。
 * 例："烟花公爵" vs "烟花伯爵" → 3（烟、花、爵各自命中）
 *     "烟花公爵" vs "小丑公爵" → 2（公、爵命中）
 * 相比「只看是否 fuzzyMatch」，此得分能区分真正更相近的候选。
 */
function _posMatchScore(query, candidate) {
  const nq = normalize(query);
  const nc = normalize(candidate);
  const len = Math.min(nq.length, nc.length);
  let score = 0;
  for (let i = 0; i < len; i++) {
    if (nq[i] === nc[i]) score++;
  }
  // 长度相同时微加权（同等得分时优先等长候选，更保守）
  if (nq.length === nc.length) score += 0.1;
  return score;
}

/**
 * fuzzyResolveSpiritName(rawName)
 * 对存量精灵名做 display-time 模糊纠偏：
 *   1. 精确命中 → 直接返回，corrected=false
 *   2. fuzzyMatch 唯一候选 → 返回纠偏名，corrected=true
 *   3. 多个候选 → 用同位置字符匹配得分排序，取最高分（真正最相似）
 *      例："烟花公爵" → [烟花伯爵(3分), 小丑公爵(2分)] → 返回"烟花伯爵"
 *   4. 无候选 → 原名，corrected=false（不乱猜）
 * 返回：{ resolved: string, corrected: boolean }
 */
export function fuzzyResolveSpiritName(rawName) {
  if (!rawName) return { resolved: rawName, corrected: false };
  const trimmed = rawName.trim();
  // 精确命中
  if (_FUZZY_SPIRIT_POOL.includes(trimmed)) return { resolved: trimmed, corrected: false };
  // 模糊查找
  const candidates = _FUZZY_SPIRIT_POOL.filter(n => fuzzyMatch(n, trimmed));
  if (candidates.length === 0) return { resolved: trimmed, corrected: false };
  if (candidates.length === 1) return { resolved: candidates[0], corrected: true };
  // 多个候选：按同位置字符匹配得分降序排，取最高分（真正最相似的候选）
  // 得分相同时再按长度差升序（等距时保守取等长）
  candidates.sort((a, b) => {
    const scoreA = _posMatchScore(trimmed, a);
    const scoreB = _posMatchScore(trimmed, b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return Math.abs(a.length - trimmed.length) - Math.abs(b.length - trimmed.length);
  });
  return { resolved: candidates[0], corrected: true };
}
