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
    shinies: ['治愈兔', '火红尾', '燃薪虫'],
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
    shinies: ['粉星仔'],
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
    shinies: ['格兰种子', '奇丽草'],
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
    unlockA: '抓/进化20只梦悠悠',
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
    type: '燃薪虫',
    icon: '🔥',
    iconImg: `${base}attrs/fire.png`,       // 柴渣虫/燃薪虫属性1：火系
    color: '#F48FB1',
    fruitA: '柴渣虫果实',
    fruitB: null,
    spiritA: '柴渣虫',
    spiritB: null,
    shinies: ['燃薪虫'],
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

// 所有可产出的异色精灵（去重）
export const ALL_SHINIES = [...new Set(PLANS.flatMap(p => p.shinies))];

// ─── 精灵第一属性表（用于「攒系别池」方案的可出异色判断） ────────────────────
// 来源：异色规则文档 + 游戏内精灵属性
// 第一属性 = 4.23后计入系别池的属性
export const SPIRIT_ATTR1 = {
  // 火系
  '治愈兔':   'fire',
  '火红尾':   'fire',
  '燃薪虫':   'fire',   // 柴渣虫进化，属性1：火系
  // 冰系
  '大耳帽兜': 'ice',
  '呼呼猪':   'ice',
  '月牙雪熊': 'ice',    // 冰+幻，属性1：冰系
  // 电系
  '拉特':     'electric',
  '粉粉星':   'electric', // 电+幻，属性1：电系
  // 幻系
  '粉星仔':   'phantom',
  '哭哭菇':   'phantom',  // 单幻系
  // 草系
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
  // 电系（双灯鱼：电+水，属性1：电系）
  '双灯鱼':   'electric',
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
