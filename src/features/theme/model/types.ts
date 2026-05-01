import type { RESOLVED_THEMES, THEMES } from './constants';

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export type ResolvedTheme = (typeof RESOLVED_THEMES)[keyof typeof RESOLVED_THEMES];
