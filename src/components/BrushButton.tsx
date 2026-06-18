// 指南 · 笔触按钮
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';
  children: ReactNode;
};

export function BrushButton({ variant = 'default', children, className = '', ...rest }: Props) {
  const cls =
    'jx-btn' +
    (variant === 'primary' ? ' jx-btn-primary' : '') +
    (variant === 'ghost' ? ' jx-btn-ghost' : '') +
    (className ? ' ' + className : '');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
