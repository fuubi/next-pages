export type LanguageConfig = {
    [key: string]: string;
};

export function createI18n<T extends LanguageConfig>(
    languages: T,
    defaultLang: keyof T
) {
    type Language = keyof T;

    function getLangFromUrl(url: URL): Language {
        const [, lang] = url.pathname.split('/');
        if (lang in languages) return lang as Language;
        return defaultLang;
    }

    function useTranslatedPath(lang: Language) {
        return function translatePath(path: string, l: Language = lang) {
            return `/${String(l)}${path}`;
        };
    }

    function getAlternateLanguageUrls(currentPath: string, currentLang: Language) {
        // Remove current language prefix from path
        const pathWithoutLang =
            currentPath.replace(new RegExp(`^/${String(currentLang)}`), '') || '/';

        return Object.keys(languages).map((lang) => ({
            lang: lang as Language,
            url: `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`,
        }));
    }

    return {
        languages,
        defaultLang,
        getLangFromUrl,
        useTranslatedPath,
        getAlternateLanguageUrls,
    };
}
