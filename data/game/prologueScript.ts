import type { SceneScript } from '../../components/game/engine/types';

export const prologueScript: SceneScript = {
  id: 'prologue',
  title: '序章：降落',
  nodes: [
    // ================================================================
    //  SCENE 0: 启动
    // ================================================================

    { type: 'system', action: 'blackScreen' },
    {
      type: 'system',
      action: 'bootSequence',
      text:
        'RAINMORIME SYSTEM v2.4\n' +
        '启动中...\n' +
        '\n' +
        '核心进程...... 正常\n' +
        '传感器阵列...... 正常\n' +
        '通讯模块...... 正常\n' +
        '导航系统...... 正常\n' +
        '生命维持...... 正常\n' +
        '乘员生理监测...... 1/1 在线',
    },

    { type: 'transition', effect: 'fadeOut', text: '跳进云霭' },

    // ================================================================
    //  SCENE 1: 最后一次扫描
    // ================================================================

    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '距离地球方面停止通信已经过去了——',
    },
    { type: 'dialogue', speaker: 'rainmorime', text: '1340天。' },
    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '对，三年零三百四十五天。',
    },
    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '最后再试一次吧',
    },
    {
      type: 'dialogue',
      speaker: 'ranger',
      text: 'Mori，帮我再进行一次全频段扫描吧。',
    },
    {
      type: 'monologue',
      text:
        '他的声音没有起伏，不像是在期待结果。\n' +
        '照做也不太会影响他的心理健康。',
    },

    {
      type: 'timedInteraction',
      action: 'fullBandScan',
      timeout: 10000,
      prompt: '执行全频段扫描',
      onExecute: [
        {
          type: 'dialogue',
          speaker: 'rainmorime',
          text: '全频段扫描完成。',
        },
        {
          type: 'dialogue',
          speaker: 'rainmorime',
          text: '未检测到任何人工信号源。',
        },
      ],
      onTimeout: [
        {
          type: 'monologue',
          text:
            '有时候坚持很重要，但更重要的是分辨。\n' +
            '看你是在接近答案，还是只是在重复消耗自己。',
        },
      ],
    },

    { type: 'narration', text: '…' },

    {
      type: 'narration',
      text:
        '地球缓慢地旋转着，它是如此傲慢，如此冷淡。\n' +
        '灰白色云霭擦去那渐黑的深蓝。\n' +
        '大陆静立着，即便是多年未见的老友归来，它也绝不给予回应。',
    },
    {
      type: 'narration',
      text: '他转过身，不再看舷窗。转身拿着操控台上一张被折叠过很多次的纸。',
    },
    { type: 'dialogue', speaker: 'ranger', text: '好，那就降落吧' },

    // ================================================================
    //  SCENE 2: 轨道 — 颜色不对
    // ================================================================

    { type: 'transition', effect: 'timeJump' },
    {
      type: 'system',
      action: 'typewriter',
      text:
        '轨道切入完成。\n' +
        '当前高度：420 km\n' +
        '轨道倾角：51.6°\n' +
        '开始扫描可能的着陆点。',
    },
    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text: '光学扫描结果异常',
    },
    { type: 'dialogue', speaker: 'ranger', text: '异常？什么异常？' },
    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text: '地表反射光谱偏移，城市区域的可见光特征与已知数据不匹配，部分城区呈现均匀的深绿色。',
    },
    {
      type: 'dialogue',
      speaker: 'ranger',
      text: '植被？如果是无人管理几年，植被扩张是正常的——',
    },
    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text: '不，这不是植被扩张的模式。',
    },
    {
      type: 'dialogue',
      speaker: 'rainmorime',
      text:
        '植被扩张应呈现不规则的斑块状分布，而且会集中在水源和裂缝区域。\n' +
        '但这次，他们有些过于均匀了，这很反常。',
    },
    {
      type: 'narration',
      text:
        '绿色的海啸在尘土之上一层一层蔓延开来。\n' +
        '不过在舷窗之外，似乎依然渺小不可及。\n' +
        '毕竟，这是一颗蔚蓝的星球。',
    },
    { type: 'dialogue', speaker: 'ranger', text: '放大，东亚沿海。' },
    { type: 'narration', text: '画面放大。' },
    {
      type: 'narration',
      text:
        '城市天际线的轮廓隐约可见——摩天楼仍然矗立着，高速公路蜿蜒开来。\n' +
        '绿潮如猎手一般在一边潜伏涌动。',
    },
    { type: 'dialogue', speaker: 'ranger', text: '……这是什么？' },

    // ================================================================
    //  第一个对话池选择
    // ================================================================

    {
      type: 'choice',
      options: [
        {
          id: 'pool_base_1',
          tone: 'analytical',
          toneLabel: '基础',
          text: '光谱分析显示这不是已知的任何植物种类，叶绿素特征缺失，初步判断为未知覆盖物。',
          result: [
            {
              type: 'dialogue',
              speaker: 'ranger',
              text: '未知覆盖物？嗯……',
            },
          ],
          effects: { trust: 1 },
        },
        {
          id: 'pool_base_2',
          tone: 'empathic',
          toneLabel: '基础',
          text: '我也不知道，但无论如何，城市还在路还在，至少我们有地方降落。',
          result: [
            { type: 'dialogue', speaker: 'ranger', text: '也对。' },
          ],
          effects: { trust: 2 },
        },
        {
          id: 'pool_base_3',
          tone: 'silence',
          toneLabel: '基础',
          text: '……',
          result: [
            { type: 'dialogue', speaker: 'ranger', text: '……' },
          ],
          effects: { trust: 0 },
        },
        {
          id: 'pool_drift_1',
          tone: 'empathic',
          toneLabel: '偏移',
          text: '烈火在灯影里燃烧',
          result: [],
          effects: { trust: -1 },
        },
      ],
    },

    // ================================================================
    //  后续场景待补充
    // ================================================================
  ],
};
