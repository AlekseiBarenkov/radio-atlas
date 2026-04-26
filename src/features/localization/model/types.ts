import type { LANGUAGES } from './constants';

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];
