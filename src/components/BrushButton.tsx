// 指南 · 笔触按钮
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';
  children: ReactNode;
};

export function BrushButton({ variant = 'default', children, className = '', ...rest }: Props) {
  const cls =
    'cp-btn' +
    (variant === 'primary' ? ' cp-btn-primary' : '') +
    (variant === 'ghost' ? ' cp-btn-ghost' : '') +
    (className ? ' ' + className : '');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
