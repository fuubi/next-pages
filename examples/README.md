# Example Pages

This folder contains complete page examples that demonstrate how to use the shared components and templates together.

## Structure

- **components/** - Component showcase page demonstrating all available UI components
- **moon-landing/** - Full landing page template for automotive/garage businesses (single page, dark theme)
- **garage-multi-lang/** - Complete multi-language garage website with i18n support (3 languages)

## TypeScript Configuration

The `tsconfig.json` in this folder provides path aliases for easy imports:

- `@shared/*` - Maps to the shared package components, layouts, styles, etc.
- `@site/*` - Placeholder for your site-specific paths (update when copying to your site)

When copying examples to your site, update your site's `tsconfig.json` to include:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../../packages/shared/*"],
      "@site/*": ["src/*"]
    }
  }
}
```

## Usage

These examples are meant to be copied and adapted for your specific site:

1. Copy the example folder you want to use
2. Adjust the content (JSON files, text)
3. Update imports to match your site structure:
   - `@shared/` imports should work if your tsconfig is configured
   - Uncomment and update `@site/` imports for your styles and i18n
4. Customize the styling/theme as needed

## Note

Examples may include site-specific dependencies (i18n utils, custom styles, etc.) that you'll need to adapt for your project. Each example includes a README with detailed instructions.
