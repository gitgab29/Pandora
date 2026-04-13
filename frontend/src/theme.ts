export const colors = {
  primary:      '#2e7cfd',
  primaryDark:  '#226de6',
  blueGrayMd:   '#466291',
  blueGrayDark: '#425066',
  grayDark:     '#31353c',
  grayDarkest:  '#2a2d33',
  textPrimary:  '#030c23',
  cyanAccent:   '#2dfcf9',
  orangeAccent: '#fc9c2d',
} as const;

/**
 * Typography scale — all font sizes in rem (root = 16px).
 * Line heights are unitless ratios.
 */
export const typography = {
  heading: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: '3.5rem',    // 56px
    lineHeight: 1.179,     // 66px / 56px
  },
  subheading: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 400,
    fontSize: '1.25rem',   // 20px
    lineHeight: 1.4,       // 28px / 20px
  },
  subheadingBold: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: '1.25rem',   // 20px
    lineHeight: 1.4,
  },
  body: {
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 400,
    fontSize: '1rem',      // 16px
    lineHeight: 1.625,     // 26px / 16px
  },
  bodyBold: {
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',      // 16px
    lineHeight: 1.625,
  },
} as const;

/**
 * Spacing scale — rem values relative to root 16px.
 * Use for padding, margin, gap.
 */
export const spacing = {
  xs:  '0.25rem',    // 4px   (unchanged — too small to reduce)
  sm:  '0.45rem',    // ~7px  (was 8px)
  md:  '0.675rem',   // ~11px (was 12px)
  lg:  '0.9rem',     // ~14px (was 16px)
  xl:  '1.125rem',   // ~18px (was 20px)
  xl2: '1.375rem',   // ~22px (was 24px)
  xl3: '1.75rem',    // ~28px (was 32px)
  xl4: '2.75rem',    // ~44px (was 48px)
} as const;

/**
 * Border-radius scale — rem values.
 */
export const radius = {
  sm:   '0.375rem',  // 6px
  md:   '0.5rem',    // 8px
  lg:   '0.75rem',   // 12px
  xl:   '1rem',      // 16px
  xl2:  '1.5rem',    // 24px
  full: '9999px',
} as const;

/**
 * Fixed UI dimensions — rem values.
 */
export const sizing = {
  sidebarExpanded:  '13.75rem',  // 220px
  sidebarCollapsed: '4rem',      // 64px
  headerHeight:     '3.75rem',   // 60px
} as const;
