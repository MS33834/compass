// 镜心 · 置信度

import { computeUserVector } from './vector';
import type { Item } from '../items/item.types';

/** 完成度 0.6 + 决断度 0.4 */
export function confidence(answers: Record<string, number>, pool: readonly Item[]): number {
  const answered = Object.keys(answers).length;
  const completeness = Math.min(1, answered / 30);

  const user = computeUserVector(answers, pool);
  const mean = user.reduce((s, v) => s + v, 0) / 12;
  const variance = user.reduce((s, v) => s + (v - mean) ** 2, 0) / 12;
  const decisiveness = Math.min(1, variance * 8);

  return 0.6 * completeness + 0.4 * decisiveness;
}
