import type { CSSProperties } from 'react';
import { colors, surfaces } from '../theme';

export const TH: CSSProperties = {
  padding: '0.625rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.719rem',
  fontWeight: 600,
  color: colors.blueGrayMd,
  textAlign: 'left',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${surfaces.rowBorder}`,
  backgroundColor: colors.bgStripe,
};

export const TD: CSSProperties = {
  padding: '0.6875rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.8125rem',
  color: colors.textPrimary,
  borderBottom: `1px solid ${surfaces.rowDivider}`,
  whiteSpace: 'nowrap',
};

export const NEW_BG       = surfaces.newRowBg;
export const NEW_BG_HOVER = surfaces.newRowBgHover;
export const HOVER_BG     = surfaces.rowHoverBg;

export function restingBg(isNewRow: boolean, idx: number): string {
  if (isNewRow) return NEW_BG;
  return idx % 2 === 0 ? colors.bgSurface : colors.bgStripe;
}
