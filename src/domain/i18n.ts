// 指南 · 内容 i18n 基础类型
//
// LocalString 兼容两种形态：
//   - 纯字符串：现有中文数据保持原样，pickLang 当 zh 处理，向后兼容
//   - { zh, en } 双语对象：新数据可逐域迁移，无需一次性翻译全部
//
// 这样设计让 items / figures / blurb 等内容字段可逐步从 string 升级到双语，
// 而不破坏任何现有数据或算法（算法只用 weights / vector，与语言无关）。

export type LocalString = string | { zh: string; en: string };

export function pickLang(ls: LocalString, lang: 'zh' | 'en'): string {
  if (typeof ls === 'string') return ls;
  return ls[lang] ?? ls.zh ?? ls.en ?? '';
}
