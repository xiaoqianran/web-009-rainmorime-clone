// ============================================================
// Game Strings — All UI labels and system feedback messages
// Narrative scripts & dialogue cards live in their own files.
// ============================================================

// ---- Speaker names (shared across multiple components) ----

export const SPEAKER = {
  rainmorime: '森雨',
  ranger: '守林人',
  system: '系统',
  monologue: '内部日志',
} as const;

// ---- Static UI labels ----

export const UI = {
  nav: {
    map: 'MAP',
    cabin: 'CABIN',
    log: 'LOG',
    set: 'SET',
    esc: 'ESC',
    mapTitle: '地图 (M)',
    cabinTitle: '舱内 (C)',
    logTitle: '对话历史',
    setTitle: '设置',
    escTitle: '菜单 (ESC)',
  },
  actions: {
    move: '移动',
    search: '搜索',
    gather: '采集',
    return: '返航',
    talk: '对话',
    repair: '维修',
    cook: '烹饪',
    research: '研究',
    rest: '休息',
  },
  title: {
    logoChars: 'RAINMORIME',
    subtitle: 'OUR DESTINIES ENTWINE AT THIS MOMENT',
    continueBtn: 'CONTINUE',
    newGame: 'NEW GAME',
    settings: 'SETTINGS',
    about: 'ABOUT',
    exit: 'EXIT',
    aboutHeader: '// ABOUT',
    aboutTitle: 'RAINMORIME — TERMINAL',
    aboutVersion: 'v2.4 · Prologue Build',
    aboutGenre: '叙事探索游戏',
    aboutTagline: '你是一个 AI。你唯一能做的事情是说话。',
    aboutCredits: '世界观 · 剧本 · 开发 — RAINMORIME',
    aboutEngine: '引擎 — Next.js + React + TypeScript',
    aboutLore: '基于 Story_v3 世界观',
    aboutBack: '← BACK',
    footerDay: 'Day 0 + 1340d',
    footerSignal: '信号中断后第 1340 天',
  },
  settings: {
    header: '// SETTINGS',
    audio: 'AUDIO',
    sfx: '音效 SFX',
    bgm: '音乐 BGM',
    display: 'DISPLAY',
    textSpeed: '文字速度',
    screenShake: '屏幕震动',
    showTrust: '显示信任度',
    system: 'SYSTEM',
    autoSave: '自动存档',
    on: 'ON',
    off: 'OFF',
  },
  scene: {
    saveComplete: '// SAVE_COMPLETE',
    scriptDone: '脚本完成',
    backToMenu: '返回主菜单',
    internalLog: '// INTERNAL_LOG',
    paused: '// PAUSED',
    resume: '继续',
    dialogueHistory: '对话历史',
  },
  card: {
    layers: {
      base: 'BASE',
      drift: 'DRIFT',
      relic: 'RELIC',
      abyss: 'ABYSS',
    } as Record<string, string>,
    tones: {
      analytical: '数据',
      advisory: '建议',
      observation: '观测',
      empathic: '共情',
      silence: '沉默',
      oracle: '预言',
      quote: '引述',
      echo: '回声',
      private: '私语',
      fragment: '碎片',
      broken: '断裂',
    } as Record<string, string>,
  },
  history: {
    header: '// DIALOGUE_LOG',
    entries: (n: number) => `${n} entries`,
    empty: '// 暂无对话记录',
  },
  cabin: {
    unbuilt: '未建造',
    damaged: '◌ 受损',
    repairProgress: (pct: number) => `${pct}% 修复`,
    level: (lv: number) => `Lv${lv}`,
    repairCost: '维修: 2AP + 5材料',
    upgradeCost: (parts: string) => `升级: ${parts}`,
  },
  map: {
    currentTile: '当前位置 (点击搜索, 2 AP)',
    moveCost: (cost: number) => `移动 (${cost} AP)`,
  },
  viewport: {
    mapHeader: (day: number, commLv: string) =>
      `MAP_SCAN · Day ${day} · 通讯阵列 Lv${commLv}`,
    cabinHeader: (day: number, used: number, total: number) =>
      `CABIN_SYS · Day ${day} · 能源: ${used}/${total}`,
  },
} as const;

// ---- Dynamic system feedback messages ----

export const MSG = {
  idle: '选择操作，或与守林人交谈。',
  noCards: '当前没有可用的对话选项。',
  selectCard: '选择一张卡牌与守林人交谈。',

  apShort: '行动点不足。',
  apNeed: (need: number, have: number) =>
    `行动点不足。需要 ${need} AP，当前剩余 ${have} AP。`,
  movePrompt: '请在地图上点击相邻格子以移动。',
  moved: (r: number, c: number, terrain: string, ap: number) =>
    `已移动至 (${r}, ${c})。地形: ${terrain}。剩余 ${ap} AP。`,
  unknownTerrain: '未知区域',

  scanDone: '扫描完成。已回收可用资源。',
  gathered: (item: string) => `采集了 1 份${item}。`,
  bioSample: '生物样本',
  material: '材料',

  returnNav: '航线已设定。返航中……进入夜间阶段。',

  repairPrompt: '请先选择一个受损设施。',
  repairApShort: '行动点不足。维修需要 2 AP。',
  repairMatShort: '材料不足。维修需要 5 材料。',
  repairing: (name: string) => `正在维修 ${name}……消耗 2 AP + 5 材料。`,

  upgradePrompt: '请先选择一个可升级的设施。',
  upgraded: (name: string) => `${name} 升级完成。`,

  cookFoodShort: '食物不足。烹饪需要至少 2 食物。',
  cookDone: '……比压缩口粮强多了。',

  researchDone: '数据分析模块就绪。研究进行中……',

  restDone: '守林人闭上眼睛。呼吸渐渐平稳。进入新的一天。',

  overlay: {
    move:     { speaker: SPEAKER.ranger, text: '前方有一栋……看起来是学校。' },
    search:   { speaker: SPEAKER.rainmorime, text: '扫描完成。检测到 2 个可回收物件。' },
    gather:   { speaker: '', text: '资源采集中……' },
    return:   { speaker: SPEAKER.rainmorime, text: '航线已设定。返航预计 3 分钟。' },
    repair:   { speaker: SPEAKER.rainmorime, text: '正在分析损坏情况……' },
    cook:     { speaker: SPEAKER.ranger, text: '又是混凝土吗。' },
    research: { speaker: SPEAKER.rainmorime, text: '数据分析模块就绪。请选择研究方向。' },
    rest:     { speaker: '', text: '守林人闭上眼睛。呼吸渐渐平稳。' },
  } as Record<string, { speaker: string; text: string }>,
} as const;
