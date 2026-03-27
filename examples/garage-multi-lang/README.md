# Multi-Language Garage Website Example

A complete example of a multi-language automotive workshop/garage website with internationalization (i18n) support.

## Structure

```
garage-multi-lang/
├── index.astro              # Root redirect to default language
├── i18n/
│   └── utils.ts            # i18n configuration (languages, default)
├── de/                     # German version
│   ├── index.astro
│   └── index.json
├── fr/                     # French version
│   ├── index.astro
│   └── index.json
└── it/                     # Italian version
    ├── index.astro
    └── index.json
```

## Features

- **Multi-language support** - German (de), French (fr), Italian (it)
- **Language switcher** - Navigate between languages
- **Alternate language URLs** - Proper SEO with hreflang tags
- **Content separation** - JSON files for easy content management
- **Utility bar** - Phone, hours, location display
- **Components used**:
  - Hero (garage variant with trust indicators)
  - ServiceGrid (automotive services)
  - ContactBlock (contact form/info)
  - Footer (classic variant with all info)

## How to Use

1. **Copy the entire folder** to your site's `src/pages/` directory
2. **Update i18n/utils.ts** with your supported languages
3. **Customize content** in each language's `index.json` file
4. **Update imports**:
   - Change `@shared/` imports to `@colombalink/shared/`
   - Change `@site/` imports to your site's relative paths
5. **Add your domain** in the `alternateLanguages` URLs
6. **Customize styling** by importing your theme tokens/global CSS

## i18n Setup

The example uses the shared i18n utilities from `@colombalink/shared/utils/i18n.ts`:

```typescript
import { createI18n } from '@shared/utils/i18n.ts';

export const languages = {
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
};

export const defaultLang = 'de';

const i18n = createI18n(languages, defaultLang);
export const { getLangFromUrl, useTranslatedPath, getAlternateLanguageUrls } = i18n;
```

## Content Structure

Each language folder has:

- **index.astro** - Page template (mostly identical across languages)
- **index.json** - Translated content with structure for:
  - Utility bar (phone, hours, location)
  - Hero section (headline, text, CTAs, trust indicators)
  - Services section (headline, service cards)
  - Contact section

## Notes

- The root `index.astro` redirects visitors to the default language
- Language paths are: `/de/`, `/fr/`, `/it/`
- Each page includes language switcher and alternate language tags for SEO
- Content is separated from markup for easier translation management
