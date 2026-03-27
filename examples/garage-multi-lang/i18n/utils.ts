// When copying to your site, use: import { createI18n } from '@shared/utils/i18n.ts';
// Or update to: import { createI18n } from '@colombalink/shared/utils/i18n.ts';
import { createI18n } from '../../../utils/i18n.ts';

export const languages = {
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'de';

// Create i18n utilities with site configuration
const i18n = createI18n(languages, defaultLang);

// Re-export all utilities
export const { getLangFromUrl, useTranslatedPath, getAlternateLanguageUrls } = i18n;
