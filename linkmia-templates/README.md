# LinkMia Templates

**Create beautiful, customizable "link in bio" pages for restaurants** — like Linktree, but better.

Built for the LinkMia restaurant marketing service. Fast, mobile-optimized, and fully customizable.

---

## 🎯 What This Is

A collection of **3 professional link page templates** designed specifically for restaurants, food trucks, and food businesses.

Each template is:
- ✅ **Mobile-first** — Optimized for Instagram/TikTok traffic
- ✅ **Easy to customize** — Edit one config object, done
- ✅ **Fast loading** — Single HTML file, no dependencies
- ✅ **PWA-ready** — Can be installed as an app
- ✅ **Analytics-ready** — Built-in click tracking hooks

---

## 📁 Repository Structure

```
linkmia-templates/
├── templates/           # Core template files
│   ├── minimal/        # Clean, simple layout
│   ├── hero/           # Bold, image-focused layout
│   └── card/           # Modern, card-based layout
├── examples/           # Live examples (El Paisa Tacos)
├── docs/               # Documentation
├── scripts/            # Automation tools
└── assets/             # Shared resources
```

---

## 🚀 Quick Start

### 1. Choose a Template

| Template | Best For | Preview |
|----------|----------|---------|
| **Minimal** | Simple branding, no hero photo | [View Example](examples/elpaisa-minimal.html) |
| **Hero** | Stunning food photography | [View Example](examples/elpaisa-hero.html) |
| **Card** | Modern, professional look | [View Example](examples/elpaisa-card.html) |

### 2. Copy the Template

```bash
cp templates/hero/index.html my-restaurant.html
```

### 3. Edit the Config

Open `my-restaurant.html` and find the `RESTAURANT_CONFIG` object (around line 470):

```javascript
const RESTAURANT_CONFIG = {
    name: "Your Restaurant Name",
    tagline: "Your Tagline",
    location: "City, State",
    hours: "Open Daily 11am - 10pm",
    
    layout: {
        style: "hero",  // "minimal", "hero", or "card"
        image: {
            url: "your-logo-url.jpg",
            heroBackground: "your-hero-image.jpg"
        },
        colors: {
            primary: "#FF6B35",
            secondary: "#F7931E"
        }
    },
    
    buttons: [
        {
            text: "🛵 Order Delivery",
            url: "https://your-ordering-link.com",
            type: "primary"
        }
        // Add more buttons...
    ],
    
    social: {
        instagram: "https://instagram.com/yourrestaurant"
    }
};
```

### 4. Deploy

Upload to any web host:
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Your own domain

---

## 📚 Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** — Step-by-step customization
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** — How to go live
- **[Template Comparison](docs/TEMPLATE_COMPARISON.md)** — Which layout to choose

---

## 🎨 The 3 Templates

### Minimal
**Clean and simple** — Small circular logo, solid background, centered content.

**Use when:**
- Client doesn't have professional food photography
- Client wants something straightforward
- Client has a strong logo

### Hero
**Bold and visual** — Large banner image at top, dramatic first impression.

**Use when:**
- Client has stunning food photography
- Client wants to showcase signature dishes
- Client's Instagram has beautiful visuals

### Card
**Modern and professional** — Centered card with blurred background, depth and dimension.

**Use when:**
- Client wants something polished
- Client has a good photo but wants it subtle
- Client values design quality

---

## 🛠️ Features

### Easy Customization
Edit one JavaScript object to change:
- Restaurant name, tagline, location
- Colors (primary, secondary, text)
- Logo/hero images
- Buttons (text, URL, style)
- Social media links
- Operating hours

### Layout Options
- **3 distinct styles** (minimal, hero, card)
- **Flexible spacing** (compact, comfortable, spacious)
- **Background options** (solid color, image, blurred image)
- **Button styles** (primary gradient, secondary outlined)

### Mobile-Optimized
- Responsive design
- Touch-friendly buttons
- Fast loading
- Works on all devices

### Analytics-Ready
Built-in click tracking hooks for:
- Button clicks
- Social media clicks
- Custom events

Integrate with:
- Google Analytics
- Mixpanel
- Your own analytics

---

## 📦 What's Included

### Templates (`templates/`)
- `minimal/index.html` — Minimal layout template
- `hero/index.html` — Hero layout template
- `card/index.html` — Card layout template

### Examples (`examples/`)
- `elpaisa-minimal.html` — El Paisa Tacos (minimal style)
- `elpaisa-hero.html` — El Paisa Tacos (hero style)
- `elpaisa-card.html` — El Paisa Tacos (card style)

### Documentation (`docs/`)
- `SETUP_GUIDE.md` — How to customize templates
- `DEPLOYMENT_GUIDE.md` — How to deploy
- `TEMPLATE_COMPARISON.md` — Choosing the right layout
- `BUTTON_EXAMPLES.md` — Common button configurations

### Scripts (`scripts/`)
- `generate.py` — Automated client page generator (coming soon)

---

## 🎯 Use Cases

### For LinkMia Clients
Create custom-branded link pages for restaurant clients:
1. Show them the 3 examples
2. They pick a style
3. You customize with their branding
4. Deploy to subdomain (e.g., `elpaisa.linkmia.com`)
5. They add to Instagram bio

### For Your Own Restaurant
Use these templates for your own business:
1. Pick a template
2. Customize with your info
3. Deploy to your domain
4. Add to social media bios

### As a Portfolio
Show potential clients what you can build:
- Professional templates
- Fast turnaround
- Custom branding

---

## 🚀 Deployment Options

### GitHub Pages (Free)
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create linkmia-clients --public
git push -u origin main

# Enable GitHub Pages
gh repo edit --enable-pages --pages-branch main

# Access at: yourusername.github.io/linkmia-clients/
```

### Netlify (Free, Fast)
1. Drag & drop your HTML file
2. Get instant URL
3. Custom domain supported

### Custom Domain
1. Buy domain (e.g., `linkmia.com`)
2. Set up subdomains (e.g., `elpaisa.linkmia.com`)
3. Upload files to hosting
4. Point DNS records

---

## 🎨 Customization Examples

### Change Colors
```javascript
colors: {
    primary: "#DC143C",      // Red for Italian
    secondary: "#009246",    // Green accent
    text: "#ffffff",
    textMuted: "#888888",
    cardBackground: "#2a2a2a"
}
```

### Add More Buttons
```javascript
buttons: [
    { text: "🛵 Order Delivery", url: "...", type: "primary" },
    { text: "🥡 Order Pickup", url: "...", type: "primary" },
    { text: "📍 Directions", url: "...", type: "secondary" },
    { text: "📞 Call Us", url: "tel:+1...", type: "secondary" },
    { text: "📖 Menu", url: "...", type: "secondary" },
    { text: "🎁 Gift Cards", url: "...", type: "secondary" }
]
```

### Use Background Image
```javascript
background: {
    type: "image",
    value: "https://images.unsplash.com/photo-restaurant.jpg",
    blur: 5  // Blur amount (0-10)
}
```

---

## 💡 Pro Tips

### Image Sources
- **Unsplash** — Free, high-quality food photos
- **Client's Instagram** — Use their best posts
- **Client's Logo** — Upload to your server

### Color Schemes
- **Mexican:** Coral (#FF6B35) + Orange (#F7931E)
- **Italian:** Red (#C8102E) + Green (#009246)
- **Asian:** Crimson (#DC143C) + Gold (#FFD700)
- **Healthy:** Green (#7CB342) + Orange (#FFA726)

### Button Order
1. **Primary actions first** (Order Delivery, Order Pickup)
2. **Secondary actions next** (Directions, Call, Menu)
3. **Max 5-6 buttons** (too many = overwhelming)

### Mobile Testing
Always test on mobile:
- Most traffic comes from Instagram/TikTok
- Buttons should be easy to tap
- Text should be readable

---

## 🤝 Contributing

This is a private repository for LinkMia restaurant clients. If you have suggestions or improvements, please reach out.

---

## 📄 License

Proprietary — For LinkMia use only.

---

## 🆘 Support

Questions? Issues? Contact: [your email]

---

## 🎉 Credits

Built with ❤️ for LinkMia restaurant clients.

**Template Version:** 2.0  
**Last Updated:** December 2024
