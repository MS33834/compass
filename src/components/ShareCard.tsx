/// <reference types="vite/client" />
// 指南 · 结果分享卡
//
// 用 Canvas 绘制一张国风分享图，供用户下载或调用系统分享。
// 不依赖 html2canvas，避免新增包；以文字印章替代人物肖像，规避跨域与加载不确定性。

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { BrushButton } from './BrushButton';
import { OverlayPortal } from './OverlayPortal';
import { useT } from '../i18n';
import { useStore } from '../store';
import { pickLang } from '../domain/i18n';
import type { MatchReport } from '../domain/matching/report';

const CARD_WIDTH = 900;
const CARD_HEIGHT = 500;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawShareCard(
  canvas: HTMLCanvasElement,
  report: MatchReport,
  t: ReturnType<typeof useT>,
  locale: 'zh' | 'en'
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CARD_WIDTH * dpr;
  canvas.height = CARD_HEIGHT * dpr;
  canvas.style.width = `${CARD_WIDTH}px`;
  canvas.style.height = `${CARD_HEIGHT}px`;
  ctx.scale(dpr, dpr);

  const { primary } = report;
  const domainName = t.path.domains[primary.figure.domain]?.name ?? primary.figure.domain;
  const scorePct = Math.round(primary.score * 100);
  const figureName = pickLang(primary.figure.name, locale);
  const figureEra = pickLang(primary.figure.era, locale);
  const figureSignature = pickLang(primary.figure.signature, locale);

  // ── 底色：宣纸 ──
  ctx.fillStyle = '#f5efe0';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 轻微纹理噪点
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * CARD_WIDTH;
    const y = Math.random() * CARD_HEIGHT;
    ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#a8322e';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  ctx.restore();

  // ── 水墨边框 ──
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48);
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, CARD_WIDTH - 64, CARD_HEIGHT - 64);

  // ── 边角装饰线 ──
  ctx.beginPath();
  ctx.moveTo(24, 120);
  ctx.lineTo(120, 120);
  ctx.lineTo(120, 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CARD_WIDTH - 24, CARD_HEIGHT - 120);
  ctx.lineTo(CARD_WIDTH - 120, CARD_HEIGHT - 120);
  ctx.lineTo(CARD_WIDTH - 120, CARD_HEIGHT - 24);
  ctx.stroke();

  // ── 左侧印章肖像 ──
  const sealX = 90;
  const sealY = 160;
  const sealSize = 160;
  ctx.fillStyle = 'rgba(168, 50, 46, 0.12)';
  ctx.fillRect(sealX, sealY, sealSize, sealSize);
  ctx.strokeStyle = '#a8322e';
  ctx.lineWidth = 4;
  ctx.strokeRect(sealX + 8, sealY + 8, sealSize - 16, sealSize - 16);

  ctx.fillStyle = '#a8322e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${sealSize * 0.55}px "STXingkai", "STKaiti", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(figureName.slice(0, 1), sealX + sealSize / 2, sealY + sealSize / 2 + 6);

  // ── 右侧主信息 ──
  let y = 130;
  const leftX = 320;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#6a6a6a';
  ctx.font = `24px "STKaiti", "STSong", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(`${domainName} · ${figureEra}`, leftX, y);

  y += 72;
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `bold 72px "STXingkai", "STKaiti", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(figureName, leftX, y);

  y += 52;
  ctx.fillStyle = '#a8322e';
  ctx.font = `32px "STXingkai", "STKaiti", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(t.shareCard.affinity(scorePct), leftX, y);

  // ── 分隔墨线 ──
  y += 40;
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(CARD_WIDTH - 80, y);
  ctx.stroke();

  // ── 签名 ──
  y += 56;
  ctx.fillStyle = '#252525';
  ctx.font = `italic 28px "STKaiti", "STSong", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  const signature =
    figureSignature.length > 28 ? figureSignature.slice(0, 27) + '…' : figureSignature;
  ctx.fillText(`“${signature}”`, leftX, y);

  // ── 底部品牌 ──
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6a6a6a';
  ctx.font = `20px "STKaiti", "STSong", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(t.ui.appName, CARD_WIDTH - 80, CARD_HEIGHT - 70);

  ctx.font = `16px "STKaiti", "STSong", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(window.location.href, CARD_WIDTH - 80, CARD_HEIGHT - 44);

  // ── 右下角小印章 ──
  const cornerSealSize = 56;
  const csx = CARD_WIDTH - 90 - cornerSealSize;
  const csy = 90;
  ctx.fillStyle = '#a8322e';
  ctx.fillRect(csx, csy, cornerSealSize, cornerSealSize);
  ctx.fillStyle = '#f5efe0';
  ctx.textAlign = 'center';
  ctx.font = `bold 28px "STXingkai", "STKaiti", "KaiTi", "SimKai", "Noto Serif SC", "Source Han Serif SC", "WenQuanYi Bitmap Song", "AR PL UMing HK", serif`;
  ctx.fillText(t.ui.sealChar, csx + cornerSealSize / 2, csy + cornerSealSize / 2 + 4);

  // 尝试把真实肖像叠到左侧印章之上（同域资源通常可加载）
  const portraitSrc = primary.figure.portrait.startsWith('/')
    ? primary.figure.portrait
    : `${import.meta.env.BASE_URL}${primary.figure.portrait}`;
  const img = await loadImage(portraitSrc);
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(sealX + 12, sealY + 12, sealSize - 24, sealSize - 24);
    ctx.clip();
    ctx.globalAlpha = 0.9;
    const aspect = img.width / img.height;
    let dw = sealSize - 24;
    let dh = dw / aspect;
    if (dh > sealSize - 24) {
      dh = sealSize - 24;
      dw = dh * aspect;
    }
    const dx = sealX + 12 + (sealSize - 24 - dw) / 2;
    const dy = sealY + 12 + (sealSize - 24 - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

type Props = { report: MatchReport; onClose: () => void };

export function ShareCard({ report, onClose }: Props) {
  const t = useT();
  const locale = useStore(s => s.locale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    setReady(false);
    setRenderError(false);
    drawShareCard(canvasRef.current, report, t, locale)
      .then(() => setReady(true))
      .catch(() => setRenderError(true));
  }, [report, t, locale]);

  // ESC 关闭 + 禁止背景滚动
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // 入场动画
  useEffect(() => {
    if (!overlayRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.cp-share-card-scroll',
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      );
    }, overlayRef);
    return () => ctx.revert();
  }, []);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvasRef.current);
      if (!blob) {
        setRenderError(true);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compass-${report.primary.figure.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const handleSystemShare = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvasRef.current);
      if (!blob) {
        setRenderError(true);
        return;
      }
      const file = new File([blob], `compass-${report.primary.figure.id}.png`, {
        type: 'image/png',
      });
      const shareData: ShareData = {
        title: t.share.title,
        text: `${t.share.text} — ${pickLang(report.primary.figure.name, locale)}`,
        files: [file],
      };
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await handleDownload();
      }
    } catch {
      // 用户取消或分享失败时退回到下载
      await handleDownload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <OverlayPortal>
      <div
        ref={overlayRef}
        className="cp-share-card-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-card-title"
        onClick={e => e.target === overlayRef.current && onClose()}
      >
        <div className="cp-share-card-scroll" tabIndex={-1}>
          <div className="cp-share-card-content">
            <header className="cp-share-card-header">
              <h2 id="share-card-title">{t.shareCard.title}</h2>
              <BrushButton
                variant="ghost"
                onClick={onClose}
                className="cp-share-card-close"
                aria-label={t.shareCard.close}
              >
                ← {t.shareCard.close}
              </BrushButton>
            </header>

            <div className="cp-share-card-preview">
              <canvas
                ref={canvasRef}
                aria-label={t.shareCard.alt(pickLang(report.primary.figure.name, locale))}
                className={
                  ready
                    ? 'cp-share-card-canvas'
                    : 'cp-share-card-canvas cp-share-card-canvas--loading'
                }
              />
              {!ready && !renderError && (
                <div className="cp-share-card-loading" aria-live="polite">
                  {t.shareCard.rendering}
                </div>
              )}
              {renderError && (
                <div className="cp-share-card-loading" role="alert">
                  {t.shareCard.renderError}
                </div>
              )}
            </div>

            <div className="cp-share-card-actions">
              <BrushButton
                variant="primary"
                onClick={handleDownload}
                disabled={!ready || busy}
                data-testid="btn-download-card"
              >
                {t.shareCard.download}
              </BrushButton>
              <BrushButton
                onClick={handleSystemShare}
                disabled={!ready || busy}
                data-testid="btn-system-share"
              >
                {t.shareCard.share}
              </BrushButton>
              <BrushButton variant="ghost" onClick={onClose}>
                {t.shareCard.close}
              </BrushButton>
            </div>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
