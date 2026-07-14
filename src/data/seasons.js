/**
 * 赛季数据配置
 * S1「暗夜拾光」/ S2「狂欢怪谈」/ S3「铅字幻梦」（S3 待上线，暂隐藏）
 */

export const SEASONS = {
  S1: {
    id: 'S1',
    name: '暗夜拾光',
    label: 'S1 暗夜拾光',
    desc: 'S1 赛季异色精灵（历史赛季）',
    startDate: '2024-01-01',
    endDate: null,
    isActive: false,
    isHistorical: true,
  },
  S2: {
    id: 'S2',
    name: '狂欢怪谈',
    label: 'S2 狂欢怪谈',
    desc: 'S2 赛季异色精灵（当前赛季）',
    startDate: '2026-05-15',
    endDate: null,
    isActive: true,        // S3 上线后改为 false
    isHistorical: false,   // S3 上线后改为 true
  },
  // S3 待上线，暂隐藏；上线时：isActive→true, isHistorical→false, startDate→实际日期
  // 同时把 DEFAULT_SEASON 改为 'S3'，SEASON_LIST 把 SEASONS.S3 加回第一位
  S3: {
    id: 'S3',
    name: '铅字幻梦',
    label: 'S3 铅字幻梦',
    desc: 'S3 赛季异色精灵（当前赛季）',
    startDate: '2026-xx-xx',  // 待游戏更新后填写实际上线日期
    endDate: null,
    isActive: false,      // ← S3 上线前保持 false，用户不可见
    isHistorical: false,
  },
};

/**
 * 默认赛季（S3 上线前默认显示 S2）
 * S3 上线时改为 'S3'
 */
export const DEFAULT_SEASON = 'S2';

/**
 * 赛季列表（用于切换器，当前赛季在前）
 * S3 上线时把 SEASONS.S3 加回第一位
 */
export const SEASON_LIST = [
  SEASONS.S2,  // 当前赛季
  SEASONS.S1,  // 历史赛季
];

/**
 * 根据赛季 ID 获取赛季信息
 */
export function getSeasonById(seasonId) {
  return SEASONS[seasonId] || SEASONS.S2;
}

/**
 * 判断是否为历史赛季
 */
export function isHistoricalSeason(seasonId) {
  return SEASONS[seasonId]?.isHistorical || false;
}
