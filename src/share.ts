// 指南 · 报告 / 答 序列化
// 仅含 answers + domain + currentIndex + locale + theme，不含任何指纹字段

import type { DomainId } from './domain/figures/figure.types';

export type ExportShape = {
  v: 1;
  ts: number;
  domain: DomainId | null;
  currentIndex: number;
  answers: Record<string, number>;
  locale: 'zh' | 'en';
  theme: 'light' | 'dark';
};

const VALID_DOMAINS: readonly DomainId[] = [
  'east-literati',
  'east-statesman',
  'east-scientist',
  'west-philosopher',
  'west-scientist',
];

/** 校验导入数据结构，防止非法数据崩溃应用 */
function isValidShape(obj: unknown): obj is ExportShape {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  if (o.v !== 1) return false;
  // domain 可为 null 或合法 DomainId
  if (o.domain !== null && !VALID_DOMAINS.includes(o.domain as DomainId)) return false;
  if (typeof o.currentIndex !== 'number' || !Number.isInteger(o.currentIndex) || o.currentIndex < 0)
    return false;
  if (!o.answers || typeof o.answers !== 'object') return false;
  // 校验 answers 的值均为有限数字
  for (const v of Object.values(o.answers as Record<string, unknown>)) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return false;
  }
  if (o.locale !== 'zh' && o.locale !== 'en') return false;
  if (o.theme !== 'light' && o.theme !== 'dark') return false;
  return true;
}

export function exportState(s: Omit<ExportShape, 'v' | 'ts'>): ExportShape {
  return {
    v: 1,
    ts: Date.now(),
    domain: s.domain,
    currentIndex: s.currentIndex,
    answers: s.answers,
    locale: s.locale,
    theme: s.theme,
  };
}

// base64url 编码（UTF-8 安全）
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toB64 = (s: string) => {
  const bytes = textEncoder.encode(s);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64 = (s: string) => {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - (s.length % 4)) % 4);
  const binary = atob(norm);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return textDecoder.decode(bytes);
};

export function encodeResume(s: ExportShape): string {
  return toB64(JSON.stringify(s));
}

export function decodeResume(s: string): ExportShape | null {
  try {
    const obj = JSON.parse(fromB64(s));
    if (!isValidShape(obj)) return null;
    return obj;
  } catch {
    return null;
  }
}

export function downloadJSON(s: ExportShape, filename = 'compass.json') {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readJSONFile(file: File): Promise<ExportShape | null> {
  const text = await file.text();
  try {
    const obj = JSON.parse(text);
    if (!isValidShape(obj)) return null;
    return obj;
  } catch {
    return null;
  }
}
