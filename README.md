# Astro Marketing Site

An AI-friendly static website system built with Astro for marketing pages.

## Core Principles

- **Static-first**: All pages prerendered at build time
- **Content-driven**: Content collections as single source of truth
- **HTML-first**: Semantic HTML, CSS for responsiveness, minimal JS
- **Minimal dependencies**: Small, understandable dependency tree
- **One content source**: Responsive CSS, no mobile/desktop duplication

## Getting Started

### Prerequisites

- Node.js 20+
- npm or your preferred package manager

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:4321`

### Build

```bash
npm run build
```

Static files generated to `dist/`

### Preview Build

```bash
npm run preview
```

## Project Structure

```
src/
  pages/          # File-based routing
  layouts/        # Page layouts
  components/     # Reusable components
    site/         # Site shell (Header, Footer, etc.)
    sections/     # Marketing sections
    ui/           # UI primitives
  content/        # Content collections (single source of truth)
    pages/        # Page content
    site/         # Global settings
    shared/       # Shared content blocks
  styles/         # Global styles and tokens
```

## Content Editing

See [`.github/AGENTS.md`](.github/AGENTS.md) for detailed guidelines on editing content and working with this system.

### Quick Start

1. **Create a new page**: Add a JSON file to `src/content/pages/`
2. **Edit existing page**: Modify the relevant content file
3. **Add testimonials/FAQs**: Edit files in `src/content/shared/`
4. **Update navigation**: Edit `src/content/site/settings.json`

## Available Section Types

- `hero` - Hero section with headline, CTA
- `feature-grid` - Grid of features
- `feature-split` - Side-by-side feature + image
- `logo-cloud` - Partner/client logos
- `stats-row` - Statistics counters
- `testimonials` - Customer testimonials
- `faq` - Accordion FAQ
- `cta-section` - Call-to-action banner
- `contact-block` - Contact form/info

## Tech Stack

- **Framework**: Astro 6 (static mode)
- **Content**: JSON-based content collections
- **Styling**: Scoped CSS with design tokens
- **TypeScript**: Type-safe content schemas

## License

MIT
