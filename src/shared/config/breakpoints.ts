/**
 * Matches Tailwind's default `md` breakpoint (768px). Keep in sync with any
 * `max-md:`/`md:` Tailwind variants used for the same responsive behavior —
 * Tailwind compiles its breakpoints into static CSS, so this JS-side value
 * can't be derived from the Tailwind config at runtime and must be updated
 * by hand if the breakpoint ever changes.
 */
export const MOBILE_BREAKPOINT_PX = 768;

export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`;
