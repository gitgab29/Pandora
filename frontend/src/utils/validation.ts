export const isBlank = (v: string): boolean => !v.trim();

export const isValidEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const isPositiveInt = (v: number, max?: number): boolean =>
  Number.isInteger(v) && v >= 1 && (max === undefined || v <= max);
