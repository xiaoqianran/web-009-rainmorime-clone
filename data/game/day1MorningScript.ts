// ============================================================
// Day 1 Morning — Bridge from prologue to free play
// Picks up after the "Day 1 / 森雨行动 — 第一天" typewriter
// ============================================================

import type { SceneScript } from '../../components/game/engine/types';

export const day1MorningScript: SceneScript = {
  id: 'day1_morning',
  title: 'Day 1 — 晨间',
  nodes: [
    { type: 'system', action: 'fadeIn' },

    {
      type: 'narration',
      text:
        '光线从舱壁的微裂缝渗进来——不是阳光应有的颜色。' +
        '偏绿，像透过一层不存在的滤镜。' +
        '外壳上凝着露水，顺着焊接痕缓缓滑落。',
    },

    {
      type: 'monologue',
      text:
        '晨间系统简报 — Day 1\n' +
        '\n' +
        '外部温度：14.2°C。湿度：89%。\n' +
        '风速：< 0.5 m/s。\n' +
        '覆盖物边界：340m，无变化。\n' +
        '\n' +
        '飞船状态：\n' +
        '  能源核心 — 在线。日产能：受损，约 40%\n' +
        '  通讯阵列 — 在线。全频段扫描：无信号\n' +
        '  制造终端 — 离线。需要维修\n' +
        '  数据终端 — 离线。修复进度 42%\n' +
        '  净水系统 — 在线。储备充足\n' +
        '\n' +
        '乘员状态：\n' +
        '  心率 58bpm（浅睡眠→清醒过渡中）\n' +
        '  体温 36.6°C\n' +
        '  精神压力指标：中高',
    },

    {
      type: 'narration',
      text:
        '守林人翻了个身。' +
        '他的呼吸节奏变了——从每分钟十二次平稳上升到十六次。' +
        '他醒了。',
    },

    {
      type: 'narration',
      text:
        '他没有立刻起来。' +
        '躺在那里，盯着舱顶看了大约四十秒。' +
        '然后他深吸一口气，坐起来，用手背擦了擦眼睛。',
    },

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '……几点了。',
    },

    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text: '当地时间 06:17。日出是 38 分钟前。你的睡眠时长是五小时四十分钟。',
    },

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '够了。',
    },

    {
      type: 'monologue',
      text:
        '（不够。五小时四十分钟，REM 阶段占比 11%。远低于建议值。）\n' +
        '（但我没说。）',
    },

    {
      type: 'narration',
      text:
        '守林人站起来，活动了一下肩膀。' +
        '他走到舱门边，把手掌贴在金属表面上。' +
        '很凉。',
    },

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '外面什么情况？',
    },

    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text:
        '覆盖物没有进一步扩张。周围 340 米内的状态和昨晚一样。' +
        '基地附近有几个可搜索的区域，东北方向扫描到了一处建筑遗迹的信号。',
    },

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '计划呢？',
    },

    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text:
        '建议分两步。先检查飞船设施——制造终端的修复是优先事项。' +
        '之后可以外出搜索周边地块，补充材料储备。',
    },

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '……行。你带路。',
    },

    {
      type: 'monologue',
      text:
        '他说"你带路"。\n' +
        '一个 AI 不会带路。一个 AI 提供导航建议。\n' +
        '但我知道他的意思。\n' +
        '\n' +
        '森雨行动，第一天。开始。',
    },

    { type: 'system', action: 'fadeOut' },
  ],
};
