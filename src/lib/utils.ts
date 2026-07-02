// 类名合并工具：过滤掉假值后用空格拼接，便于条件式组合 Tailwind 类名
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
