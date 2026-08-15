// ============================================================
// Dialogue Card Pool — starter set for empty_city phase
// Each card: what 森雨 says → how 守林人 responds → trust/state effects
// ============================================================

import type { DialogueCard } from '../../components/game/engine/types';

export const dialogueCards: DialogueCard[] = [
  // ---- BASE layer · analytical ----
  {
    id: 'base_analytical_01',
    text: '根据昨晚的传感器数据，覆盖物的扩张速度是每小时 0.3 米。',
    layer: 'base',
    tone: 'analytical',
    weight: 10,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 1 },
    ranger_response: '又快了。',
    ranger_response_high_trust: '……比昨天又快了一点。你觉得是因为温度吗？',
  },
  {
    id: 'base_analytical_02',
    text: '飞船外壳的微裂纹密度增加了 12%。建议优先修复制造终端。',
    layer: 'base',
    tone: 'analytical',
    weight: 8,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 1, flags_set: ['hull_warning_given'] },
    ranger_response: '修复列表越来越长了。',
  },
  {
    id: 'base_analytical_03',
    text: '气象模块预测未来 48 小时内有一次大范围降水。能见度会降至 200 米以下。',
    layer: 'base',
    tone: 'analytical',
    weight: 9,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 0 },
    ranger_response: '那就明天不出门了。',
    ranger_response_high_trust: '好。那今天多走远一点。',
  },

  // ---- BASE layer · advisory ----
  {
    id: 'base_advisory_01',
    text: '食物储备还能维持六天。建议今天的路线优先经过回声城东翼——上次扫描到罐装物资的信号。',
    layer: 'base',
    tone: 'advisory',
    weight: 10,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 2 },
    ranger_response: '你说的那个信号……你确定不是覆盖物的干扰？',
    ranger_response_high_trust: '好，走东翼。你带路。',
  },
  {
    id: 'base_advisory_02',
    text: '守林人，你的睡眠数据显示 REM 阶段严重不足。建议今晚提前休息。',
    layer: 'base',
    tone: 'advisory',
    weight: 7,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 1, morale_delta: 2 },
    ranger_response: '……你还监控我的睡眠？',
    ranger_response_high_trust: '嗯。今晚早点。',
  },

  // ---- BASE layer · empathic ----
  {
    id: 'base_empathic_01',
    text: '你今天的步频比平时慢了 15%。如果累了，我们可以找个地方休息。',
    layer: 'base',
    tone: 'empathic',
    weight: 8,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 2, morale_delta: 3 },
    ranger_response: '我没事。',
    ranger_response_high_trust: '……嗯，找个有遮挡的地方坐一会儿。',
  },
  {
    id: 'base_empathic_02',
    text: '你刚才看了那张照片很久。那是……以前认识的人？',
    layer: 'base',
    tone: 'empathic',
    weight: 6,
    gate: { phase: ['empty_city'], trust_min: 40 },
    effect: { trust_delta: 3, morale_delta: -2 },
    ranger_response: '不想说。',
    ranger_response_high_trust: '……算是吧。一个朋友。',
  },

  // ---- BASE layer · observation ----
  {
    id: 'base_observation_01',
    text: '空白地的边界今天又后退了 3 厘米。很精确，像是有什么在度量。',
    layer: 'base',
    tone: 'observation',
    weight: 9,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 1, flags_set: ['blank_retreat_observed'] },
    ranger_response: '你觉得空白地是活的？',
    ranger_response_high_trust: '越来越不对劲了。',
  },

  // ---- DRIFT layer ----
  {
    id: 'drift_private_01',
    text: '有时候我在想——如果那七十二小时的空白记忆被找回来……我还会是现在这个"我"吗？',
    inner: '这个问题没有出现在任何任务日志里。',
    layer: 'drift',
    tone: 'private',
    weight: 4,
    gate: { phase: ['empty_city'], trust_min: 55 },
    effect: { trust_delta: 3, flags_set: ['drift_memory_question'] },
    ranger_response: '……你想找回来吗？',
    ranger_response_high_trust: '不管找不找回来，你就是你。',
  },
  {
    id: 'drift_echo_01',
    text: '守林人。你有没有注意到——覆盖物的扩张模式和我的数据索引结构……有 97% 的相似度。',
    layer: 'drift',
    tone: 'echo',
    weight: 3,
    gate: { phase: ['empty_city'], trust_min: 45, one_time: true },
    effect: { trust_delta: 2, flags_set: ['correlation_revealed'] },
    ranger_response: '……什么意思？',
    ranger_response_high_trust: '你是在说……你和那东西有关系？',
  },

  // ---- BASE layer · silence ----
  {
    id: 'base_silence_01',
    text: '……',
    inner: '有些时候不说话也是一种回应。',
    layer: 'base',
    tone: 'silence',
    weight: 5,
    gate: { phase: ['empty_city'] },
    effect: { trust_delta: 0, morale_delta: 1 },
    ranger_response: '……',
    ranger_response_high_trust: '……嗯。',
  },

  // ---- RELIC layer (requires a relic) ----
  {
    id: 'relic_quote_01',
    text: '这台旧收音机……我能修好它。频率范围在 87-108 MHz。也许能收到什么。',
    layer: 'relic',
    tone: 'quote',
    weight: 6,
    gate: { phase: ['empty_city'], requires_relic: 'old_radio', one_time: true },
    effect: { trust_delta: 3, flags_set: ['radio_repaired'] },
    ranger_response: '你真的觉得还有人在广播？',
    ranger_response_high_trust: '好。修吧。',
  },
];
