# Moon Landing Garage Template - Quick Reference

## 🚀 Quick Start

**View the template:** Visit `/de/template-moon-landing` after starting the dev server

**Files to edit:**
- Content: [`/pages/de/template-moon-landing.json`](sites/garage-mueller/src/pages/de/template-moon-landing.json)
- Theme: [`/styles/tokens-moon-landing.css`](sites/garage-mueller/src/styles/tokens-moon-landing.css)
- Layout: [`/pages/de/template-moon-landing.astro`](sites/garage-mueller/src/pages/de/template-moon-landing.astro)

## 📐 Template Structure

```
┌─────────────────────────────────────────┐
│           HERO SECTION                  │
│  ┌───────────────────────────────────┐  │
│  │  Ihr Auto in besten Händen.      │  │
│  │  [Orange Gradient Headline]      │  │
│  │                                   │  │
│  │  Moderne Werkstatt mit Werten    │  │
│  │                                   │  │
│  │  [Termin buchen] [Services]      │  │
│  │                                   │  │
│  │  [Workshop/Car Image]            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      AUTOMOTIVE SERVICES GRID           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 🔧 Icon │ │ 🔍 Icon │ │ ⚙️ Icon │  │
│  │ Service │ │ Diagnose│ │ Repair  │  │
│  │  &Insp. │ │  Tech   │ │  Work   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 🎨 Icon │ │ 🛞 Icon │ │ ✓ Icon  │  │
│  │  Body   │ │  Tire   │ │  MFK    │  │
│  │  & Paint│ │ Service │ │  Check  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       CAR BRANDS SECTION                │
│   Alle Marken willkommen                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ VW │ │Audi│ │BMW │ │Merc│ │Opel│  │
│  └────┘ └────┘ └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │Ford│ │Rena│ │Peug│ │Toyo│ │More│  │
│  └────┘ └────┘ └────┘ └────┘ └────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CTA SECTION                     │
│  Bereit für den nächsten Service?       │
│  Vereinbaren Sie jetzt einen Termin     │
│  [Termin buchen] [Anrufen]              │
└─────────────────────────────────────────┘
```

## 🎨 Theme Tokens

### Colors
```css
Primary:    #f57c00 (Orange - warmth/action)
Secondary:  #455a64 (Steel blue - professional)
Accent:     #d32f2f (Red - urgency)

Background: #1a1a1a (Dark charcoal)
Surface:    #2d2d2d (Dark surface)
Text:       #ffffff (White)
```

### Key Features
- 🔧 **Orange Gradient** - Action-oriented headline
- 🪟 **Glass Morphism** - Modern frosted glass cards
- ✨ **Metallic Texture** - Subtle industrial background
- 🎨 **Automotive Colors** - Orange/Steel/Red palette
- 📱 **Responsive** - Mobile-first, scales beautifully

## 🔧 Customization Guide

### Change Colors
Edit [`tokens-moon-landing.css`](sites/garage-mueller/src/styles/tokens-moon-landing.css):
```css
:root {
  --color-primary: #YOUR_COLOR;
  --color-secondary: #YOUR_COLOR;
  --gradient-primary: linear-gradient(135deg, #START, #END);
}
```

### Update Content
Edit [`template-moon-landing.json`](sites/garage-mueller/src/pages/de/template-moon-landing.json):
```json
{
  "hero": {
    "headline": "Your Garage Name Here",
    "text": "Your service description",
    "cta": { "text": "Book Appointment", "href": "/contact" }
  }
}
```

### Change Layout
Edit [`template-moon-landing.astro`](sites/garage-mueller/src/pages/de/template-moon-landing.astro):
- Reorder components
- Add/remove sections
- Change variants
- Adjust spacing

## 🎯 Use Cases

Perfect for:
- ✅ Automotive workshops & garages
- ✅ Car repair services
- ✅ MOT/MFK testing centers
- ✅ Tire & wheel specialists
- ✅ Body shops & paint services
- ✅ Multi-brand service centers
- ✅ Independent mechanics

## 📦 Components Used

1. **Hero** - `variant="centered"` - Large centered hero with orange gradient
2. **FeatureGrid** - `variant="three-column"` - 6 automotive services
3. **LogoCloud** - Default variant - Car brands you service
4. **CTASection** - `variant="primary"` - Booking call-to-action

## 🚀 Next Steps

1. **Customize Content**: Update JSON with your garage's services
2. **Brand Colors**: Adjust CSS tokens to match your brand
3. **Add Photos**: Replace placeholders with workshop/vehicle images
4. **Car Brands**: Update logos with brands you service
5. **Contact Info**: Update phone numbers and booking URLs
6. **Test**: Check responsive behavior on mobile devices
7. **Deploy**: Build and publish your garage website

## 💡 Pro Tips for Garages

- Use **automotive emoji** (🔧 🔍 ⚙️ 🛞 🎨) for quick prototyping
- Replace with **professional SVG icons** for production
- Add **trust badges** (certifications, years in business)
- Use **real workshop photos** for authenticity
- Include **customer reviews** for social proof
- Add **emergency contact** button prominently
- Show **operating hours** clearly
- Consider **WhatsApp booking** integration
- Add **Google Maps** for easy navigation

## 🔧 Common Customizations

### Change to Your Brand Orange
```css
--color-primary: #YOUR_ORANGE;
--gradient-primary: linear-gradient(135deg, #YOUR_START, #YOUR_END);
```

### Add Emergency Banner
Add to top of template:
```astro
<UtilityBar 
  message="24/7 Notdienst verfügbar" 
  phone="+41442345678"
/>
```

### Switch to Light Mode
Comment out dark background, use light tokens

### Add More Services
Add items to `features.items` array in JSON

## 🎨 Industry Variations

**Body Shop** → Use red/metallic silver  
**Tire Shop** → Use black/steel theme  
**Luxury Service** → Use gold/premium colors  
**Classic Cars** → Use vintage palette

## 🔗 Related Documentation

- [Full Template Guide](TEMPLATE-MOON-LANDING.md)
- [Component Versioning](../../COMPONENT-VERSIONING.md)
- [Theme Customization](THEME-CUSTOMIZATION.md)

---

**Need help?** Check the full documentation or modify the template to fit your needs!
