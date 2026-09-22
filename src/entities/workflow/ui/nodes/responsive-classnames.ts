/**
 * Explicit small size for node connection handles — kept close to React
 * Flow's own default (6px; this is 10px for a slightly easier-to-see target
 * plus a higher-contrast fill color) rather than enlarged for touch.
 *
 * Do NOT enlarge this significantly: `Handle` attaches its own
 * `onMouseDown`/`onTouchStart` to start a connection drag, and
 * `.react-flow__handle.connectionindicator` (which sets `pointer-events:
 * all`) is active whenever the handle is connectable and no connection is
 * in progress — i.e. essentially always, not just on hover. A larger handle
 * box does not just look bigger, it enlarges the area around each node edge
 * that starts a new connection instead of dragging the node, which breaks
 * node repositioning near that edge. This was tried at 44px (a mobile-only
 * enlarged size utility) for touch-target sizing and reverted after it made
 * nodes undraggable, especially on the compact Start node. See design.md
 * decision 8 (in the archived `adapt-workflow-editor-mobile` change) for
 * the full writeup — 10px is well below the size that caused that
 * regression, but stay far from 44px.
 */
export const NODE_HANDLE_SIZE_CLASSNAME = '!size-[10px] !bg-[#6f6f6f]';

/**
 * Caps a node card's width below the mobile breakpoint so it fits small
 * viewports instead of keeping its fixed desktop width, while every field
 * inside the card stays inline-editable exactly as on desktop. Combine with
 * a node's existing fixed-width class (e.g. `w-80`); Tailwind's `max-md:`
 * variant is emitted after the base utility, so it wins on narrow screens
 * without needing `!important`.
 */
export const RESPONSIVE_NODE_WIDTH_CLASSNAME = 'max-md:w-[85vw] max-md:max-w-xs';
