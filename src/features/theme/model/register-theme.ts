import { getInitialTheme, resolveTheme } from './get-initial-theme';
import { applyThemeToDocument } from './theme-dom';

applyThemeToDocument(resolveTheme(getInitialTheme()));
