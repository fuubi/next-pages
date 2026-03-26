# Footer Component - Shared Components

Multi-variant footer component with professional designs for different use cases.

## Location
`packages/shared/components/site/Footer/`

## Available Variants

### 1. Classic Footer (`variant="classic"`)
**Best for:** Corporate websites, service businesses, dealerships
- Multi-column layout
- Company info and tagline
- Business hours display
- Contact details (phone, email, address)
- Multiple link columns
- Social media links
- Optional certification badge
- Dark theme

### 2. Minimal Footer (`variant="minimal"`)
**Best for:** Portfolios, blogs, simple landing pages
- Single-row centered layout
- Company name
- Inline navigation links
- Social links
- Light theme

### 3. Newsletter Footer (`variant="newsletter"`)
**Best for:** Marketing sites, content platforms, e-commerce
- Newsletter signup form with gradient header
- Multi-column layout
- Company info
- Quick links
- Contact details
- Social media

### 4. Compact Footer (`variant="compact"`)
**Best for:** Apps, dashboards, compact pages
- Two-column layout
- Company info on left
- Links and contact on right
- Social media links
- Blue-gray theme

## Usage

```astro
---
import Footer from '@shared/components/site/Footer/Footer.astro';

const footerData = {
  variant: 'classic', // 'classic' | 'minimal' | 'newsletter' | 'compact'
  companyName: 'Your Company',
  tagline: 'Your tagline',
  phone: '+41 44 123 45 67',
  email: 'info@company.com',
  address: 'Street Address, City',
  hours: [
    { day: 'Monday - Friday', time: '08:00 - 18:00' },
    { day: 'Saturday', time: '09:00 - 16:00' },
    { day: 'Sunday', time: 'Closed' },
  ],
  links: [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ],
  socialLinks: [
    { platform: 'Facebook', href: 'https://facebook.com' },
    { platform: 'Instagram', href: 'https://instagram.com' },
  ],
  showBadge: true, // Only for classic variant
};
---

<Footer {...footerData} />
```

## Direct Variant Import

You can also import specific variants directly:

```astro
import Classic from '@shared/components/site/Footer/Classic.astro';
import Minimal from '@shared/components/site/Footer/Minimal.astro';
import Newsletter from '@shared/components/site/Footer/Newsletter.astro';
import Compact from '@shared/components/site/Footer/Compact.astro';
```

## Props Interface

```typescript
interface Props {
  variant?: 'classic' | 'minimal' | 'newsletter' | 'compact';
  companyName?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: Array<{ day: string; time: string }>;
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; href: string }>;
  showBadge?: boolean; // Classic variant only
}
```

## Live Showcase

See all variants in action at:
**Garage Mueller:** `/templates/footer`

## Responsive Design

All variants are fully responsive:
- **Mobile (<768px):** Single column, stacked layout
- **Tablet (768px-1199px):** Adjusted grid spacing
- **Desktop (1200px+):** Full multi-column layouts

## Version History

- **v2 (Current):** Multi-variant system with 4 footer styles
- **v1:** Original footer in `v1/Footer.astro` (legacy)

## Customization

Each footer can be customized by:
1. **Colors:** Edit the CSS in the specific variant file
2. **Spacing:** Adjust padding/margin values
3. **Layout:** Modify grid configurations
4. **Content:** Pass different props
