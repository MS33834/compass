// 指南 · 笔触按钮
import { memo } from 'react';
type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';
  children: ReactNode;
};

export const BrushButton = memo(function BrushButton({
  variant = 'default',
  type = 'button',
  children,
  className = '',
  onMouseDown,
  ...rest
}: Props) {
  const cls =
    'cp-btn' +
    (variant === 'primary' ? ' cp-btn-primary' : '') +
    (variant === 'ghost' ? ' cp-btn-ghost' : '') +
    (className ? ' ' + className : '');

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--ripple-x', `${x}%`);
    btn.style.setProperty('--ripple-y', `${y}%`);
    onMouseDown?.(e);
  };

  return (
    <button type={type} className={cls} onMouseDown={handleMouseDown} {...rest}>
      {children}
    </button>
  );
}
