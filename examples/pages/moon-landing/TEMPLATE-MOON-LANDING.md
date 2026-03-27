# Moon Landing Garage Template

A modern, dark-themed website template for automotive workshops and garages. This template showcases a professional, industrial aesthetic with clean design elements perfect for the automotive industry.

## Design Philosophy

- **Dark Theme First**: Industrial dark theme with professional appearance
- **No Tailwind**: Pure CSS custom properties for maximum reusability across projects
- **Minimal & Clean**: Semantic HTML with thoughtful CSS architecture
- **Responsive**: Mobile-first approach with fluid typography and spacing
- **Accessible**: High contrast, reduced motion support, semantic markup
- **Automotive Focus**: Colors and design elements suited for garage/workshop businesses

## Components Used

### 1. Hero Section
- Centered layout with large headline
- Gradient text effect on headline (orange gradient for warmth/action)
- Two CTA buttons (Book Appointment + View Services)
- Optional hero image (workshop or vehicle)
- Uses the Hero component with `variant="centered"`

### 2. Services Grid
- 6 core automotive services displayed
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Icon + title + description cards
- Glass-morphism effect on cards (frosted glass look)
- Hover animations with lift effect
- Uses the FeatureGrid component with `variant="three-column"`

### 3. Brand Compatibility Section
- Showcases car brands you service
- Responsive grid layout (2-5 columns based on screen size)
- Grayscale filter with color on hover
- Logo brightness inverted for dark theme
- Uses the LogoCloud component

### 4. CTA Section
- Final call-to-action for booking
- Centered layout with two buttons (Book + Call)
- Uses the CTASection component with `variant="primary"`

## Color Palette

### Primary Colors
- **Primary**: `#f57c00` - Orange (trust, urgency, warmth)
- **Secondary**: `#455a64` - Steel blue (professional, industrial)
- **Accent**: `#d32f2f` - Red (urgency, attention)

### Background Colors
- **Background**: `#1a1a1a` - Dark charcoal
- **Surface**: `#2d2d2d` - Dark surface for cards
- **Surface Light**: `#3d3d3d` - Lighter surface variant

### Text Colors
- **Primary Text**: `#ffffff` - White
- **Secondary Text**: `#b5bfbc` - Warm gray
- **Tertiary Text**: `#8a9793` - Muted gray

## Special Features

### Metallic Texture Effect
A subtle metallic texture background created with pure CSS gradients. Gives an industrial, workshop feel without images!

### Gradient Text
The main headline uses an orange gradient for eye-catching, action-oriented typography:
```css
background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Glass Morphism Cards
Service cards use backdrop-filter blur for a modern, professional frosted glass effect:
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## File Structure

```
/sites/garage-mueller/src/
├── pages/
│   └── de/
│       ├── template-moon-landing.astro   # Template page
│       └── template-moon-landing.json    # Content data
└── styles/
    └── tokens-moon-landing.css            # Theme tokens
```

## Usage

### View the Template
Visit: `/de/template-moon-landing`

### Customize Content
Edit the JSON file at `/pages/de/template-moon-landing.json` to update:
- Hero headline and service description
- CTA button labels and links
- Service items (title, description, icons)
- Car brand logos
- Contact/booking CTA section

### Customize Theme
Edit the CSS tokens at `/styles/tokens-moon-landing.css` to change:
- Color palette (orange can be changed to brand colors)
- Spacing scale
- Typography
- Border radius
- Shadows and effects

### Adapt for Other Garages
1. Copy the template files to a new site
2. Rename to your desired page (e.g., `index.astro` or `services.astro`)
3. Update the JSON content with garage-specific services
4. Adjust CSS tokens to match garage brand colors
5. Replace car brand logos with relevant ones
6. Update contact information and booking links

## Responsive Behavior

### Mobile (< 640px)
- Single column layouts
- Larger touch targets (48px minimum)
- Reduced font sizes
- Simplified grid layouts

### Tablet (640px - 1023px)
- 2 column feature grid
- Maintained spacing
- Optimized for portrait tablets

### Desktop (≥ 1024px)
- Full 3 column feature grid
- Maximum width container (1280px)
- Enhanced spacing and padding
- Larger typography scale

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels where needed
- High contrast text (WCAG AA compliant)
- Keyboard navigation support
- Reduced motion support via CSS media queries
- Focus indicators on interactive elements

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- CSS custom properties required
- backdrop-filter support (graceful degradation for older browsers)
- No IE11 support needed

## Performance Considerations

- Static HTML generation (Astro SSG)
- Minimal JavaScript (only for animations)
- CSS custom properties (no runtime cost)
- Optimized images with webp format
- Lazy loading for images below the fold

## 🎯 Use Cases

Perfect for:
- ✅ Automotive workshops & garages
- ✅ Car repair services
- ✅ MOT/MFK testing centers
- ✅ Tire & wheel specialists
- ✅ Body shops & paint services
- ✅ Car maintenance centers
- ✅ Multi-brand service centers

## 📦 Components Used

1. **Hero** - `variant="centered"` - Large centered hero with gradient text and booking CTAs
2. **FeatureGrid** - `variant="three-column"` - Service showcase (6 automotive services)
3. **LogoCloud** - Default variant - Car brands serviced
4. **CTASection** - `variant="primary"` - Final booking call-to-action

## 🚀 Next Steps for Your Garage

1. **Customize Content**: Update the JSON file with your garage's services
2. **Brand Colors**: Adjust CSS tokens to match your garage brand
3. **Add Images**: Replace placeholder with workshop/vehicle photos
4. **Car Brands**: Update logo cloud with brands you service
5. **Contact Info**: Update phone numbers and booking links
6. **Test**: Check responsive behavior on various screen sizes
7. **Deploy**: Build and deploy your customized template

## 💡 Pro Tips for Garages

- Use **automotive icons** (🔧 🔍 ⚙️ 🛞) for services
- Replace with **professional SVG icons** for production
- Add **trust indicators** (years in business, certifications)
- Use **real workshop photos** for authenticity
- Include **customer testimonials** for social proof
- Add **emergency contact** button prominently
- Show **operating hours** clearly
- Consider **online booking integration**

## 🎨 Customization Ideas for Different Garage Types

### Body Shop Focus
- Change primary color to red/metallic silver
- Emphasize paint/collision services
- Add before/after gallery section

### Tire Specialist
- Use darker gray/black theme
- Highlight seasonal tire services
- Add tire brand logos instead of car brands

### Luxury Car Service
- Use gold/silver accents
- Focus on high-end brands (Porsche, BMW, Mercedes)
- Add premium service messaging

### Classic Car Restoration
- Vintage-inspired color palette
- Heritage/craftsmanship messaging
- Showcase restoration project gallery

## Future Enhancements

Potential additions for this template:
- [ ] Add Testimonials section with customer reviews
- [ ] Add Stats/metrics row (years in business, cars serviced)
- [ ] Add animated hero image (workshop photos)
- [ ] Add smooth scroll behavior
- [ ] Add online booking form integration
- [ ] Add Google Maps integration
- [ ] Add emergency service banner
- [ ] Create light mode variant

## Related Templates

- `_template-classic` - Traditional business template
- More garage templates coming soon!

---

**Template Version**: 1.0.0  
**Created**: March 2026  
**Industry**: Automotive Workshops & Garages  
**Theme**: Dark, Modern, Professional
