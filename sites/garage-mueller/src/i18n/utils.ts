import { createI18n } from '@shared/utils/i18n.ts';

export const languages = {
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'de';

// Create i18n utilities with site configuration
const i18n = createI18n(languages, defaultLang);

// Re-export for convenience
export const { getLangFromUrl, useTranslatedPath, getAlternateLanguageUrls } = i18n;

// Site-specific content loader (must be local to resolve relative imports correctly)
export async function getContent<T = any>(lang: Language, page: string): Promise<T> {
    try {
        const content = await import(`../content/${lang}/${page}.json`);
        return content.default || content;
    } catch (error) {
        // Fallback to default language
        if (lang !== defaultLang) {
            return getContent(defaultLang, page);
        }
        throw error;
    }
}
