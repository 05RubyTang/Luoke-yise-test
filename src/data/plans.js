// 果实方案常量数据
// 规则说明：只有属性1会计入池子，属性2方案已全部失效，现均为单果实循环
const base = import.meta.env.BASE_URL;

export const PLANS = [
  // ─── 属性方案（单果实循环，属性2已失效） ────────────────────────────────────
  {
    id: 'fire',
    type: '火系',
    icon: '🔥',
    iconImg: `${base}attrs/fire.png`,
    color: '#E8733A',
    fruitA: '治愈兔果实',
    fruitB: '火红尾果实',
    spiritA: '治愈兔',
    spiritB: '火红尾',
    shinies: ['治愈兔', '火红尾', '柴渣虫'],
    unlockA: '活动赠送',
    unlockB: '活动赠送',
  },
  {
    id: 'ice',
    type: '冰系',
    icon: '❄️',
    iconImg: `${base}attrs/ice.png`,
    color: '#42A5F5',
    fruitA: '呼呼猪果实',
    fruitB: '大耳帽兜果实',
    spiritA: '呼呼猪',
    spiritB: '大耳帽兜',
    shinies: ['大耳帽兜', '呼呼猪', '月牙雪熊'],
    unlockA: '抓/进化20只对应精灵',
    unlockB: '集齐 120 只风眠省精灵图鉴（星霜崖地西侧破旧船旁）',
  },
  {
    id: 'electric',
    type: '电系',
    icon: '⚡',
    iconImg: `${base}attrs/electric.png`,
    color: '#FDD835',
    fruitA: '拉特果实',
    fruitB: '小星光果实',  // 备选：电咩咩果实
    spiritA: '拉特',
    spiritB: '小星光',     // 备选：电咩咩
    shinies: ['拉特', '粉粉星', '双灯鱼'],
    unlockA: '抓/进化20只对应精灵',
    unlockB: '抓/进化20只对应精灵',
    // 小星光果实可解锁「月光能量星光狮」特殊形态
    specialFormSanctuary: {
      sanctuary: '聆风塔地底护所',
      tip: '将小星光的橡果形态（黄色星形图案）放入此底护所，可解锁「月光能量星光狮」隐藏形态',
      hiddenForm: '月光能量星光狮',
      spirit: '小星光',
    },
  },
  {
    id: 'phantom',
    type: '幻系',
    icon: '🔮',
    iconImg: `${base}attrs/phantom.png`,
    color: '#AB47BC',
    fruitA: '哭哭菇果实',
    fruitB: '仪使者果实',  // 4.23后仪使者(地+幻)只计地系池，不计幻系；放着但不抓循环
    spiritA: '哭哭菇',
    spiritB: '仪使者',
    shinies: ['粉星仔', '粉粉星', '月牙雪熊'],
    unlockA: '抓/进化20只怖哭菇',
    unlockB: '集齐 60 只风眠省精灵图鉴（旧飞艇航道下方丰裕谷入口旁）',
    phantomNote: '4.23后仪使者(地+幻)只计地系池，幻系方案只用哭哭菇单系循环',
  },
  {
    id: 'grass',
    type: '草系',
    icon: '🌿',
    iconImg: `${base}attrs/grass.png`,
    color: '#66BB6A',
    fruitA: '格兰种子果实',
    fruitB: '奇丽草果实',
    spiritA: '格兰种子',
    spiritB: '奇丽草',
    shinies: ['格兰种子', '奇丽草', '柴渣虫'],
    unlockA: '抓/进化20只对应精灵',
    unlockB: '抓/进化20只对应精灵',
  },
  {
    id: 'evil',
    type: '恶系',
    icon: '😈',
    iconImg: `${base}attrs/evil.png`,
    color: '#5D4037',
    fruitA: '小夜果实',
    fruitB: '恶魔狼果实',
    spiritA: '小夜',
    spiritB: '恶魔狼',
    shinies: ['恶魔狼', '嗜光嗡嗡'],
    unlockA: '抓/进化20只幽朔夜伊芙',
    unlockB: '抓/进化20只恶魔狼/幽朔夜伊芙',
  },
  {
    id: 'ghost',
    type: '幽系',
    icon: '👻',
    iconImg: `${base}attrs/ghost.png`,
    color: '#7E57C2',
    fruitA: '小灵面果实',
    fruitB: '墨鱿士果实',
    spiritA: '小灵面',
    spiritB: '墨鱿士',
    shinies: ['空空颅'],
    unlockA: '抓/进化20只幽冥眼',
    unlockB: '集齐 80 只洛克里安精灵图鉴（圣所前哨东南侧）',
  },
  {
    id: 'mech',
    type: '机械系',
    icon: '⚙️',
    iconImg: `${base}attrs/mech.png`,
    color: '#78909C',
    fruitA: '机械方方果实',
    fruitB: null,           // 机械系单放最优，无 fruitB
    spiritA: '机械方方',
    spiritB: null,
    shinies: ['机械方方', '贝瑟'],
    unlockA: '集齐 80 只洛克里安精灵图鉴（拾荒港口东南角）',
    unlockB: null,
  },
  {
    id: 'light',
    type: '光系',
    icon: '✨',
    iconImg: `${base}attrs/light.png`,
    color: '#FFB300',
    fruitA: '独角兽果实',
    fruitB: '犀角鸟果实',  // 备选：绒绒果实
    spiritA: '独角兽',
    spiritB: '犀角鸟',     // 备选：绒绒
    shinies: ['疾光千兽', '绒仙子'],
    unlockA: '抓/进化20只对应精灵',
    unlockB: '抓/进化20只对应精灵',
  },

  // ─── 赛季奇遇方案（第六章赛季任务单果实） ──────────────────────────────────
  // 获取方式：第六章赛季任务，捕捉2只污染血脉的对应精灵可获得
  {
    id: 'season_pinkstar',
    type: '粉粉星',
    icon: '⚡',
    iconImg: `${base}attrs/electric.png`,   // 粉粉星属性1：电系
    color: '#F48FB1',
    fruitA: '粉粉星果实',
    fruitB: null,
    spiritA: '粉粉星',
    spiritB: null,
    shinies: ['粉粉星'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的粉粉星可获得',
    unlockB: null,
    season: true,
    sanctuary: '凤息山魔力之源附近',
    sanctuaryTip: '与粉星仔果实位置相同（同一区域两个庇护所）；可与粉星仔同放省位',
    coFruit: '粉星仔果实',
  },
  {
    id: 'season_pinkbaby',
    type: '粉星仔',
    icon: '🔮',
    iconImg: `${base}attrs/phantom.png`,    // 粉星仔属性1：幻系
    color: '#F48FB1',
    fruitA: '粉星仔果实',
    fruitB: null,
    spiritA: '粉星仔',
    spiritB: null,
    shinies: ['粉星仔'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的粉星仔可获得',
    unlockB: null,
    season: true,
    sanctuary: '凤息山魔力之源附近',
    sanctuaryTip: '地图中为蓝色底座+星形图标；视野空旷，可站猫头鹰上投球',
    coFruit: '粉粉星果实',
  },
  {
    id: 'season_moonbear',
    type: '月牙雪熊',
    icon: '❄️',
    iconImg: `${base}attrs/ice.png`,        // 月牙雪熊属性1：冰系
    color: '#F48FB1',
    fruitA: '月牙雪熊果实',
    fruitB: null,
    spiritA: '月牙雪熊',
    spiritB: null,
    shinies: ['月牙雪熊'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的月牙雪熊可获得',
    unlockB: null,
    season: true,
    sanctuary: '星霜崖地魔力之源附近',
    sanctuaryTip: '雪地场景；离魔力之源极近，便于及时恢复精灵',
    coFruit: null,
  },
  {
    id: 'season_emptyskull',
    type: '空空颅',
    icon: '👻',
    iconImg: `${base}attrs/ghost.png`,      // 空空颅属性1：幽系
    color: '#F48FB1',
    fruitA: '空空颅果实',
    fruitB: null,
    spiritA: '空空颅',
    spiritB: null,
    shinies: ['空空颅'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的空空颅可获得',
    unlockB: null,
    season: true,
    sanctuary: '监管区魔力之源附近',
    sanctuaryTip: '草地+石径混合地形；可与嗜光嗡嗡同放',
    coFruit: '嗜光嗡嗡果实',
  },
  {
    id: 'season_cinder',
    type: '柴渣虫',
    icon: '🔥',
    iconImg: `${base}attrs/fire.png`,       // 柴渣虫属性1：火系
    color: '#F48FB1',
    fruitA: '柴渣虫果实',
    fruitB: null,
    spiritA: '柴渣虫',
    spiritB: null,
    shinies: ['柴渣虫'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的柴渣虫可获得',
    unlockB: null,
    season: true,
    sanctuary: '彼得大道魔力之源附近',
    sanctuaryTip: '沙滩地形；柴渣虫体型小，不推荐放在有草地的庇护所（易被遮挡）',
    coFruit: null,
  },
  {
    id: 'season_lightbuzz',
    type: '嗜光嗡嗡',
    icon: '😈',
    iconImg: `${base}attrs/evil.png`,       // 嗜光嗡嗡属性1：恶系
    color: '#F48FB1',
    fruitA: '嗜光嗡嗡果实',
    fruitB: null,
    spiritA: '嗜光嗡嗡',
    spiritB: null,
    shinies: ['嗜光嗡嗡'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的嗜光嗡嗡可获得',
    unlockB: null,
    season: true,
    sanctuary: '监管区魔力之源附近',
    sanctuaryTip: '二者均可放于同一空旷点，节省位置',
    coFruit: '空空颅果实',
  },
  {
    id: 'season_twolight',
    type: '双灯鱼',
    icon: '⚡',
    iconImg: `${base}attrs/electric.png`,   // 双灯鱼属性1：电系
    color: '#F48FB1',
    fruitA: '双灯鱼果实',
    fruitB: null,
    spiritA: '双灯鱼',
    spiritB: null,
    shinies: ['双灯鱼'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的双灯鱼可获得',
    unlockB: null,
    season: true,
    sanctuary: '沉船漩涡魔力之源附近',
    sanctuaryTip: '水边开阔，视野好；可与贝瑟共用位置（一陆一水）',
    coFruit: '贝瑟果实',
  },
  {
    id: 'season_besse',
    type: '贝瑟',
    icon: '⚙️',
    iconImg: `${base}attrs/mech.png`,       // 贝瑟属性1：机械系
    color: '#F48FB1',
    fruitA: '贝瑟果实',
    fruitB: null,
    spiritA: '贝瑟',
    spiritB: null,
    shinies: ['贝瑟'],
    unlockA: '第六章赛季任务，捕捉2只污染血脉的贝瑟可获得',
    unlockB: null,
    season: true,
    sanctuary: '沉船漩涡魔力之源附近',
    sanctuaryTip: '陆地+水域交界处；适合与双灯鱼同放（一陆一水）',
    coFruit: '双灯鱼果实',
  },
];

// ─── 果冻 / 星辰虫关键词（仅计入世界池，不计保底） ─────────────────────────
const JELLY_KEYWORDS = ['果冻', '星辰虫', '星尘虫'];

/**
 * 判断某只精灵对应的池类型（相对于当前方案）
 *
 * @param {string} spiritName - 精灵名称
 * @param {object} plan       - 当前方案对象（含 spiritA、spiritB、attrId 等字段）
 * @returns {'family'|'attribute'|'world'|'jelly'}
 *   - 'family'    : 方案主精灵（spiritA / spiritB），进家族池
 *   - 'attribute' : 同属性其他精灵，进系别池
 *   - 'world'     : 其他属性精灵，进世界池
 *   - 'jelly'     : 果冻 / 星辰虫，仅进世界池，不计保底
 */
export function classifySpiritPool(spiritName, plan) {
  if (!spiritName || !plan) return 'world';

  // 果冻 / 星辰虫：匹配关键词
  if (JELLY_KEYWORDS.some(kw => spiritName.includes(kw))) return 'jelly';

  // 方案主精灵（家族池）
  const familyNames = [plan.spiritA, plan.spiritB].filter(Boolean);
  if (familyNames.includes(spiritName)) return 'family';

  // 同属性精灵：通过 attrId 反查标准方案，取其所有 shinies
  // 自定义方案有 attrId → 找到基础属性方案 → 取 shinies 作为系别池
  // 标准属性方案直接用自身 shinies
  const allPlans = PLANS;
  const attrPlanId = plan.attrId || plan.id;   // 自定义方案 → attrId；标准方案 → 自身
  const attrPlan = allPlans.find(p => p.id === attrPlanId);
  if (attrPlan && Array.isArray(attrPlan.shinies) && attrPlan.shinies.includes(spiritName)) {
    return 'attribute';
  }

  // 兜底：世界池
  return 'world';
}

// 所有可产出的异色精灵（去重）
export const ALL_SHINIES = [...new Set(PLANS.flatMap(p => p.shinies))];

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

/**
 * 用模糊匹配在 SPIRIT_ATTR1 里查找精灵的第一属性 id
 * 直接用 SPIRIT_ATTR1 权威数据，精灵名容错
 */
function lookupAttr(spiritName) {
  if (!spiritName) return null;
  const nq = normalize(spiritName);
  // 先精确匹配（去规范化）
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (normalize(k) === nq) return v;
  }
  // 再模糊匹配
  for (const [k, v] of Object.entries(SPIRIT_ATTR1)) {
    if (fuzzyMatch(k, spiritName)) return v;
  }
  return null;
}

/**
 * 从方案对象中推断属性 id：
 *   - 标准属性方案：id 直接是属性 id
 *   - 赛季方案：从 iconImg 或 attrId 字段取
 */
function getPlanAttrId(plan) {
  if (!plan) return null;
  const BASE_IDS = new Set(['fire', 'ice', 'electric', 'phantom', 'grass', 'evil', 'ghost', 'mech', 'light']);
  if (BASE_IDS.has(plan.id)) return plan.id;
  if (plan.attrId && BASE_IDS.has(plan.attrId)) return plan.attrId;
  const m = (plan.iconImg || '').match(/attrs\/(\w+)\.png/);
  return m ? m[1] : null;
}

/**
 * 判断出货精灵属于哪个池子：
 *   'family' — 家族池（spiritA / spiritB 的同族精灵，70次保底）
 *   'attr'   — 属性池（同属性非家族精灵，80次保底）
 *   'world'  — 世界池（其他，80次保底）
 */
export function classifyResultType(resultSpirit, plan) {
  if (!resultSpirit || !plan) return 'world';
  const targetFamilies = [plan.spiritA, plan.spiritB].filter(Boolean);
  if (targetFamilies.some(t => fuzzyMatch(t, resultSpirit))) return 'family';
  const planAttrId = getPlanAttrId(plan);
  const spiritAttr = lookupAttr(resultSpirit);
  if (spiritAttr && planAttrId && spiritAttr === planAttrId) return 'attr';
  return 'world';
}

/**
 * 兼容旧数据：从 task + plan 推断池子类型
 *   - 新数据（family/attr/world）：直接用
 *   - 旧数据（pool/offpool）：尝试用 resultSpirit + plan 重新判断
 *   - 无法判断：pool→family，offpool→world
 */
export function inferPoolType(task, plan) {
  if (!task) return 'world';
  if (['family', 'attr', 'world'].includes(task.resultType)) return task.resultType;
  // 旧数据：尝试重新推断
  if (task.resultSpirit && plan) {
    return classifyResultType(task.resultSpirit, plan);
  }
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

// ─── 精灵第一属性表（用于「攒系别池」方案的可出异色判断） ────────────────────
// 来源：异色规则文档 + 游戏内精灵属性
// 第一属性 = 4.23后计入系别池的属性
export const SPIRIT_ATTR1 = {
  // 火系
  '治愈兔':   'fire',
  '火红尾':   'fire',
  '柴渣虫':   'fire',   // 火+草，属性1：火系（燃薪虫为其进化异色形态，前端统一用「柴渣虫」作 key）
  // 冰系
  '大耳帽兜': 'ice',
  '呼呼猪':   'ice',
  '月牙雪熊': 'ice',    // 冰+幻，属性1：冰系（但可被幻系属性池出货）
  // 电系
  '拉特':     'electric',
  '粉粉星':   'electric', // 电+幻，属性1：电系（但可被幻系属性池出货）
  '双灯鱼':   'electric', // 电+水，属性1：电系
  // 幻系
  '粉星仔':   'phantom',
  '哭哭菇':   'phantom',  // 单幻系
  // 草系（注意：柴渣虫第2属性是草，可被草系属性池出货，但单刷柴渣虫只计火系池）
  '格兰种子': 'grass',
  '奇丽草':   'grass',
  // 恶系
  '小夜':     'evil',
  '恶魔狼':   'evil',
  '嗜光嗡嗡': 'evil',   // 恶+光，属性1：恶系
  // 幽系
  '小灵面':   'ghost',
  '空空颅':   'ghost',  // 单幽系
  // 机械系
  '机械方方': 'mech',
  '贝瑟':     'mech',   // 机械+火，属性1：机械系
  // 光系
  '独角兽':   'light',
  '疾光千兽': 'light',
  '绒仙子':   'light',
};

// 根据属性 id 返回所有「第一属性等于该属性」的可出异色精灵
export function getShinisByAttr(attrId) {
  return ALL_SHINIES.filter(name => SPIRIT_ATTR1[name] === attrId);
}

// 赛季奇遇方案的专属精灵（season:true 方案的 shinies，去重）
export const SEASON_SHINIES = [...new Set(
  PLANS.filter(p => p.season).flatMap(p => p.shinies)
)];

// 属性方案的精灵（非赛季方案，去重），排除已在赛季奇遇 tab 展示的精灵，避免重复
const _seasonSet = new Set(SEASON_SHINIES);
export const ATTR_SHINIES = [...new Set(
  PLANS.filter(p => !p.season).flatMap(p => p.shinies)
)].filter(name => !_seasonSet.has(name));

// 根据精灵名查找所有包含该精灵的方案
export function findPlansForSpirit(name) {
  return PLANS.filter(p => p.shinies.includes(name));
}

// ─── 特殊形态庇护所攻略 ───────────────────────────────────────────────────────
// 来源：五、特殊形态庇护所攻略
// 需要将精灵的橡果形态放入指定底护所以解锁隐藏形态
export const SPECIAL_FORMS = [
  {
    spirit: '小星光',
    baseSpirit: '星光狮',          // 普通形态（有插图）
    hiddenForm: '月光能量星光狮',
    fruitImg: '星光狮果实',         // public/fruits/ 中的文件名（不含.png）
    acornDesc: '小星光的果实形态（黄色星形图案）',
    sanctuary: '聆风塔地底护所',
    planIds: ['electric'],
  },
  {
    spirit: '小狮鹫',
    baseSpirit: '皇家狮鹫（崖间地）', // 普通形态（有插图）
    hiddenForm: '高山地皇家狮鹫',
    fruitImg: '皇家狮鹫果实',
    acornDesc: '高山地样子的果实形态（绿色山形图案）',
    sanctuary: '学院驻地底护所',
    planIds: [],
  },
  {
    spirit: '地鼠',
    hiddenForm: '储水期地鼠',
    fruitImg: '地鼠果实',
    acornDesc: '储水时样子的果实形态（黄色水滴/心形图案）',
    sanctuary: '德雷克福德庄园底护所',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    hiddenForm: '短毛球形态',
    fruitImg: '蹦蹦种子果实',
    acornDesc: '短毛球果实（绿色带黑斑足球纹）',
    sanctuary: '独角兽领地底护所',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    hiddenForm: '象牙球形态',
    fruitImg: '蹦蹦种子果实',
    acornDesc: '象牙球果实（绿色带白花足球纹）',
    sanctuary: '采邑地底护所',
    planIds: [],
  },
  {
    spirit: '蹦蹦种子',
    hiddenForm: '彩玉球形态',
    fruitImg: '蹦蹦种子果实',
    acornDesc: '彩玉球果实（绿色带紫花足球纹）',
    sanctuary: '挽风屏障底护所',
    planIds: [],
  },
];
