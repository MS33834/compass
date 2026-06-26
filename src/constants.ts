// Shared UI constants for the Compass application

// ── Animation ───────────────────────────────────────────────
export const ANIMATION = {
  /** Fast animation duration in seconds (used for modal fades, quick transitions) */
  DURATION_FAST: 0.35,
  /** Standard animation duration in seconds */
  DURATION_STANDARD: 0.5,
  /** Slide/fade animation distance in pixels (y-axis) */
  SLIDE_DISTANCE_Y: 30,
  /** Slide/fade animation distance in pixels (x-axis) */
  SLIDE_DISTANCE_X: 40,
  /** Scale value for subtle shrink effect */
  SCALE_SHRINK: 0.98,
} as const;

// ── Overlay / Modal ────────────────────────────────────────
export const OVERLAY = {
  /** Modal backdrop background color (dark overlay with opacity) */
  BACKDROP_BG: `rgba(26, 26, 26, 0.45)`,
  /** Modal backdrop opacity (dark overlay) */
  BACKDROP_OPACITY: 0.45,
  /** Modal z-index */
  Z_INDEX_MODAL: 200,
} as const;

// ── Share Card Layout (all values in px) ────────────────────
// These values are used in ShareCard.tsx canvas drawing
export const SHARE_CARD = {
  /** Canvas width */
  WIDTH: 900,
  /** Canvas height */
  HEIGHT: 500,
  /** Outer border offset from canvas edge */
  BORDER_OFFSET: 24,
  /** Inner border offset from canvas edge */
  INNER_BORDER_OFFSET: 32,
  /** Seal/signature size */
  SEAL_SIZE: 160,
  /** Portrait display size */
  PORTRAIT_SIZE: 200,
} as const;

// Computed values (avoid repeating arithmetic)
export const SHARE_CARD_LAYOUT = {
  /** Outer border inner width = WIDTH - 2 * BORDER_OFFSET */
  OUTER_BORDER_INNER_WIDTH: SHARE_CARD.WIDTH - 2 * SHARE_CARD.BORDER_OFFSET,
  /** Outer border inner height = HEIGHT - 2 * BORDER_OFFSET */
  OUTER_BORDER_INNER_HEIGHT: SHARE_CARD.HEIGHT - 2 * SHARE_CARD.BORDER_OFFSET,
  /** Inner border inner width = WIDTH - 2 * INNER_BORDER_OFFSET */
  INNER_BORDER_INNER_WIDTH: SHARE_CARD.WIDTH - 2 * SHARE_CARD.INNER_BORDER_OFFSET,
  /** Inner border inner height = HEIGHT - 2 * INNER_BORDER_OFFSET */
  INNER_BORDER_INNER_HEIGHT: SHARE_CARD.HEIGHT - 2 * SHARE_CARD.INNER_BORDER_OFFSET,
} as const;
