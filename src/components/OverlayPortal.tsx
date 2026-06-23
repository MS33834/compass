import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

const container = typeof document !== 'undefined' ? document.getElementById('cp-overlays') : null;

export function OverlayPortal({ children }: { children: ReactNode }) {
  if (!container) return null;
  return createPortal(children, container);
}
