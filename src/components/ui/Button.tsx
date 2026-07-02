"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

// 变体样式表
const variantStyles: Record<ButtonVariant, string> = {
  // 主按钮：黄铜边框 + 深色填充，hover 泛黄铜微光
  primary:
    "bg-abyss-500 border border-brass text-brass hover:border-brass-light hover:shadow-[0_0_20px_rgba(201,162,39,0.35)]",
  // 次按钮：透明描边，hover 背景泛 10% 金色
  secondary:
    "bg-transparent border border-starlight/40 text-ivory hover:bg-brass/10 hover:border-brass/60",
  // 幽灵按钮：无边框，hover 微亮
  ghost:
    "bg-transparent border border-transparent text-starlight hover:bg-white/5 hover:text-ivory",
};

// 尺寸样式表
const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-base",
};

// 通用按钮组件：支持变体、尺寸、loading 状态
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          // 加载中转圈指示器
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
