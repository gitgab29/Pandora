export const colors = {
  // Brand
  primary:      '#2e7cfd',
  primaryDark:  '#226de6',
  blueGrayMd:   '#466291',
  blueGrayDark: '#425066',
  grayDark:     '#31353c',
  grayDarkest:  '#2a2d33',
  textPrimary:  '#030c23',
  cyanAccent:   '#2dfcf9',
  orangeAccent: '#fc9c2d',

  // Surfaces
  white:       '#ffffff',
  bgSurface:   '#ffffff',  // cards, modals, dropdowns
  bgSubtle:    '#f5f7fb',  // hover backgrounds (blue-tinted)
  bgHover:     '#f0f5ff',  // list item / combobox hover
  bgDisabled:  '#f3f4f6',  // disabled button background
  bgEmpty:     '#fafafa',  // empty/placeholder input background
  bgStripe:    '#f8fafc',  // alternate table row / section background
  bgErrorLight:'#fef2f2',  // light error row highlight
  grayMed:     '#6b7280',  // muted neutral (retired status, muted icons)

  // Semantic states
  error:        '#ef4444',  // validation errors, destructive actions
  success:      '#22c55e',  // positive indicators
  textDisabled: '#9ca3af',  // disabled text
  closeBtn:     '#374151',  // modal close button background

  // Borders
  border:       '#d1d5db',  // default input / card border

  // Overlays
  overlay:      'rgba(3,12,35,0.45)',  // modal backdrop
} as const;

/**
 * Semantic badge colors — used in activity/log badge chips.
 * Each entry: bg = tinted background, text = readable foreground.
 */
export const badgeColors = {
  checkIn:   { bg: 'rgba(34,197,94,0.12)',   text: '#15803d' },
  checkOut:  { bg: 'rgba(252,156,45,0.12)',  text: '#b45309' },
  update:    { bg: 'rgba(46,124,253,0.1)',   text: '#2e7cfd' },
  audit:     { bg: 'rgba(139,92,246,0.1)',   text: '#7c3aed' },
  request:   { bg: 'rgba(45,252,249,0.12)',  text: '#0891b2' },
  // Type chips
  asset:     { bg: 'rgba(46,124,253,0.1)',   text: '#2e7cfd' },
  inventory: { bg: 'rgba(45,252,249,0.12)',  text: '#0891b2' },
  license:   { bg: 'rgba(252,156,45,0.12)',  text: '#b45309' },
  // Fallback
  default:   { bg: '#f3f4f6',               text: '#374151' },
} as const;

/**
 * Asset status dot colors — used in status badge indicators.
 */
export const statusColors = {
  available: '#22c55e',  // green
  deployed:  '#2e7cfd',  // primary blue
  inRepair:  '#fc9c2d',  // orange
  retired:   '#6b7280',  // gray
  toAudit:   '#eab308',  // amber
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
 * Font-size scale — rem values relative to root 16px.
 * Use for one-off sizes not covered by the typography presets above.
 */
export const fontSize = {
  display: '3.5rem',    // 56px — page-level headings
  h1:      '2.625rem',  // 42px — stat card values
  h2:      '2.5rem',    // 40px — auth headings
  h3:      '2.25rem',   // 36px — section headings
  h4:      '2rem',      // 32px — sub-section headings
  h5:      '1.25rem',   // 20px — card titles, subheadings
  h6:      '1.0625rem', // 17px — modal titles
  body:    '1rem',      // 16px — base body text
  lg:      '0.9375rem', // 15px — form text, descriptions
  md:      '0.875rem',  // 14px — secondary text, buttons
  sm:      '0.8125rem', // 13px — labels, table text
  xs:      '0.75rem',   // 12px — captions, error text, stat labels
  micro:   '0.6875rem', // 11px — tiny captions
  label:   '0.719rem',  // ~11.5px — uppercase section headers
} as const;

/**
 * Box-shadow scale — keyed by context.
 */
export const shadows = {
  card:     '0 1px 4px rgba(3,12,35,0.06)',       // stat cards, table rows
  dropdown: '0 0.5rem 2rem rgba(3,12,35,0.12)',   // dropdowns, popovers
  modal:    '0 1.5rem 4rem rgba(3,12,35,0.18)',   // modals, drawers
  auth:     '0 2.5rem 6.25rem rgba(3,12,35,0.45)', // auth card
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
