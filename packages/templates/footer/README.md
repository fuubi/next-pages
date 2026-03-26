# Footer Component Templates

Four responsive footer variants for different use cases.

## Variants

### 1. Classic Footer
**Best for:** Corporate websites, service businesses, dealerships
**Features:** Multi-column layout, company info, links, business hours, contact details

```astro
---
import Footer from '@templates/footer/Footer.astro';

const footerData = {
  variant: 'classic',
  companyName: 'Your Business',
  tagline: 'Quality service you can trust',
  phone: '(403) 888-8174',
  email: 'contact@yourbusiness.com',
  address: '123 Main St, Calgary, AB T2A 2L2',
  hours: [
    { day: 'Monday - Friday', time: '9:00 AM – 8:00 PM' },
    { day: 'Saturday', time: '9:00 AM – 7:30 PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
  links: [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Privacy', href: '/privacy' },
  ],
  socialLinks: [
    { platform: 'Facebook', href: 'https://facebook.com' },
    { platform: 'Twitter', href: 'https://twitter.com' },
    { platform: 'Instagram', href: 'https://instagram.com' },
  ],
  showBadge: true,
};
---

<Footer {...footerData} />
```

### 2. Minimal Footer
**Best for:** Portfolios, blogs, simple landing pages
**Features:** Clean design, inline navigation, social links

```astro
---
import Footer from '@templates/footer/Footer.astro';

const footerData = {
  variant: 'minimal',
  companyName: 'Your Brand',
  links: [
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
  ],
  socialLinks: [
    { platform: 'Twitter', href: 'https://twitter.com' },
    { platform: 'LinkedIn', href: 'https://linkedin.com' },
  ],
};
---

<Footer {...footerData} />
```

### 3. Newsletter Footer
**Best for:** Marketing sites, content platforms, e-commerce
**Features:** Newsletter signup form, gradient header, contact info

```astro
---
import Footer from '@templates/footer/Footer.astro';

const footerData = {
  variant: 'newsletter',
  companyName: 'Your Company',
  tagline: 'Stay connected with us',
  phone: '(555) 123-4567',
  email: 'hello@company.com',
  links: [
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Support', href: '/support' },
    { label: 'Terms', href: '/terms' },
  ],
  socialLinks: [
    { platform: 'Facebook', href: 'https://facebook.com' },
    { platform: 'Instagram', href: 'https://instagram.com' },
  ],
};
---

<Footer {...footerData} />
```

### 4. Compact Footer
**Best for:** Apps, dashboards, compact pages
**Features:** Two-column layout, efficient use of space

```astro
---
import Footer from '@templates/footer/Footer.astro';

const footerData = {
  variant: 'compact',
  companyName: 'App Name',
  tagline: 'Making work easier',
  phone: '(555) 987-6543',
  email: 'support@app.com',
  links: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
    { label: 'API', href: '/api' },
  ],
  socialLinks: [
    { platform: 'GitHub', href: 'https://github.com' },
    { platform: 'Twitter', href: 'https://twitter.com' },
  ],
};
---

<Footer {...footerData} />
```

## Responsive Design

All footer variants are fully responsive:
- **Desktop (1200px+):** Full multi-column layouts
- **Tablet (768px-1199px):** Adjusted grid spacing
- **Mobile (<768px):** Single column, stacked layout

## Customization

Each footer can be customized by:
1. Modifying the color schemes in the style section
2. Adjusting spacing with CSS variables
3. Adding/removing sections based on needs
4. Extending with additional props

## Direct Variant Import

You can also import specific variants directly:

```astro
import Classic from '@templates/footer/Classic.astro';
import Minimal from '@templates/footer/Minimal.astro';
import Newsletter from '@templates/footer/Newsletter.astro';
import Compact from '@templates/footer/Compact.astro';
```
