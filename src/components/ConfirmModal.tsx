// 指南 · 确认弹层
// 替代原生 confirm()，避免阻塞主线程导致动画/状态异常

import { useEffect } from 'react';
import { BrushButton } from './BrushButton';
import { OverlayPortal } from './OverlayPortal';
import { OVERLAY } from '../constants';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      else if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <OverlayPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: OVERLAY.BACKDROP_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: OVERLAY.Z_INDEX_MODAL,
          padding: '1rem',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--rice)',
            border: '1px solid var(--rice-deep)',
            padding: '1.5rem',
            maxWidth: '24rem',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h2
            id="confirm-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              marginBottom: '0.75rem',
              color: 'var(--ink)',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--ink-soft)',
              marginBottom: '1.5rem',
              lineHeight: 1.7,
            }}
          >
            {message}
          </p>
          {/* MOB-007: 小屏垂直堆叠，增大触控区域 */}
          <div className="cp-confirm-actions">
            <BrushButton variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </BrushButton>
            <BrushButton variant="primary" onClick={onConfirm}>
              {confirmLabel}
            </BrushButton>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
