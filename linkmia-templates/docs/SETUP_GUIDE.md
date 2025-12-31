# LinkMia Templates — Setup Guide

Complete guide to customizing link page templates for restaurant clients.

---

## Table of Contents

1. [Choosing a Template](#choosing-a-template)
2. [Basic Configuration](#basic-configuration)
3. [Layout & Design](#layout--design)
4. [Buttons Configuration](#buttons-configuration)
5. [Social Media Links](#social-media-links)
6. [Advanced Customization](#advanced-customization)
7. [Testing](#testing)

---

## Choosing a Template

### Step 1: Understand the 3 Styles

| Template | Visual Style | Best For |
|----------|--------------|----------|
| **Minimal** | Small logo, solid background | Simple branding, no hero photo |
| **Hero** | Large banner image | Stunning food photography |
| **Card** | Centered card, blurred background | Modern, professional look |

### Step 2: Ask the Client

**Question 1:** "Do you have a great food photo you want to showcase?"
- **Yes** → Hero template
- **No** → Minimal or Card

**Question 2:** "What vibe do you want?"
- **"Clean and simple"** → Minimal
- **"Bold and visual"** → Hero
- **"Modern and professional"** → Card

### Step 3: Copy the Template

```bash
# Navigate to templates directory
cd templates/

# Copy your chosen template
cp hero/index.html ../../my-restaurant.html
```

---

## Basic Configuration

### Restaurant Information

Open your HTML file and find the `RESTAURANT_CONFIG` object (around line 470).

```javascript
const RESTAURANT_CONFIG = {
    // Basic Information
    name: "El Paisa Tacos",           // Restaurant name
    tagline: "Authentic Mexican Street Food",  // Short description
    location: "Miami, FL",            // City/neighborhood
    hours: "Open Daily 11am - 10pm",  // Operating hours
    
    // ... more config below
};
```

**Tips:**
- **Name:** Keep it short (under 20 characters looks best)
- **Tagline:** One line, describe what you do
- **Location:** City or neighborhood, not full address
- **Hours:** Be concise (e.g., "Mon-Fri 11am-9pm, Sat-Sun 10am-10pm")

---

## Layout & Design

### Layout Style

```javascript
layout: {
    style: "hero",  // Options: "minimal", "hero", "card"
    // ...
}
```

**Change this if:**
- You copied the wrong template
- Client changes their mind
- You want to try a different style

### Images

#### For Minimal & Card Templates:

```javascript
image: {
    url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop",
    heroBackground: ""  // Leave empty for minimal/card
}
```

**Image URL can be:**
- Unsplash link (free, high-quality)
- Client's logo (upload to your server)
- Client's Instagram photo (right-click → copy image address)

**Recommended size:** 400x400px (square)

#### For Hero Template:

```javascript
image: {
    url: "https://images.unsplash.com/photo-logo.jpg?w=400&h=400&fit=crop",  // Small logo
    heroBackground: "https://images.unsplash.com/photo-hero.jpg?w=1200&h=800&fit=crop"  // Large banner
}
```

**Hero background:**
- Use landscape photo (16:9 or 3:2 ratio)
- Recommended size: 1200x800px or larger
- Should be visually striking

### Background

#### Solid Color (Minimal & Hero):

```javascript
background: {
    type: "color",
    value: "#1a1a1a",  // Dark gray (hex code)
    blur: 0
}
```

#### Image with Blur (Card):

```javascript
background: {
    type: "image",
    value: "https://images.unsplash.com/photo-bg.jpg?w=1200&h=800&fit=crop",
    blur: 8  // Blur amount (0-10, higher = more blur)
}
```

**Pro tip:** Use blur 5-8 for card layout so the card stands out.

### Colors

```javascript
colors: {
    primary: "#FF6B35",      // Main button color
    secondary: "#F7931E",    // Gradient accent
    text: "#ffffff",         // Main text color
    textMuted: "#888888",    // Subtle text (location, hours)
    cardBackground: "#2a2a2a"  // Button/card backgrounds
}
```

**How to pick colors:**
1. **From logo:** Use a color picker tool
2. **From Instagram:** Screenshot their feed, pick dominant color
3. **Ask client:** "What's your brand color?"

**Popular restaurant color schemes:**

| Cuisine | Primary | Secondary |
|---------|---------|-----------|
| Mexican | `#FF6B35` (coral) | `#F7931E` (orange) |
| Italian | `#C8102E` (red) | `#009246` (green) |
| Asian | `#DC143C` (crimson) | `#FFD700` (gold) |
| Healthy/Vegan | `#7CB342` (green) | `#FFA726` (orange) |
| BBQ/Steakhouse | `#8B4513` (brown) | `#DC143C` (red) |

### Spacing

```javascript
spacing: "comfortable"  // Options: "compact", "comfortable", "spacious"
```

- **Compact:** Tight spacing, more buttons visible
- **Comfortable:** Default, balanced
- **Spacious:** Lots of breathing room, fewer buttons visible

---

## Buttons Configuration

### Button Structure

```javascript
buttons: [
    {
        text: "🛵 Order Delivery",  // Button label (with emoji)
        url: "https://order.doordash.com/store/...",  // Link destination
        type: "primary"  // Style: "primary" or "secondary"
    },
    // Add more buttons...
]
```

### Button Types

**Primary (Gradient, Prominent):**
- Use for main actions (ordering, booking)
- Limit to 1-2 primary buttons

**Secondary (Outlined, Subtle):**
- Use for supporting actions (directions, menu, contact)
- Can have 3-4 secondary buttons

### Common Button Examples

#### Ordering

```javascript
// DoorDash Storefront (Delivery)
{
    text: "🛵 Order Delivery",
    url: "https://order.doordash.com/store/restaurant-name-123456",
    type: "primary"
}

// DoorDash Storefront (Pickup)
{
    text: "🥡 Order Pickup",
    url: "https://order.doordash.com/store/restaurant-name-123456?service_type=pickup",
    type: "primary"
}

// Uber Eats
{
    text: "🛵 Order on Uber Eats",
    url: "https://www.ubereats.com/store/restaurant-name",
    type: "primary"
}

// Grubhub
{
    text: "🛵 Order on Grubhub",
    url: "https://www.grubhub.com/restaurant/...",
    type: "primary"
}
```

#### Contact

```javascript
// Phone
{
    text: "📞 Call Us",
    url: "tel:+13055551234",
    type: "secondary"
}

// WhatsApp
{
    text: "💬 Chat on WhatsApp",
    url: "https://wa.me/13055551234?text=Hi!%20I%27d%20like%20to%20order",
    type: "secondary"
}

// Email
{
    text: "📧 Email Us",
    url: "mailto:hello@restaurant.com",
    type: "secondary"
}
```

#### Location

```javascript
// Google Maps
{
    text: "📍 Get Directions",
    url: "https://maps.google.com/?q=Restaurant+Name+Miami+FL",
    type: "secondary"
}

// Waze
{
    text: "🚗 Open in Waze",
    url: "https://waze.com/ul?q=Restaurant+Name&navigate=yes",
    type: "secondary"
}

// Apple Maps
{
    text: "📍 Open in Apple Maps",
    url: "https://maps.apple.com/?q=Restaurant+Name",
    type: "secondary"
}
```

#### Menu & Info

```javascript
// PDF Menu
{
    text: "📖 View Menu",
    url: "https://example.com/menu.pdf",
    type: "secondary"
}

// Website
{
    text: "🌐 Visit Website",
    url: "https://restaurant.com",
    type: "secondary"
}

// Reservations (OpenTable)
{
    text: "🪑 Make Reservation",
    url: "https://www.opentable.com/r/restaurant-name",
    type: "secondary"
}

// Gift Cards
{
    text: "🎁 Buy Gift Card",
    url: "https://example.com/giftcards",
    type: "secondary"
}

// Reviews
{
    text: "⭐ Leave a Review",
    url: "https://g.page/r/your-google-business-id/review",
    type: "secondary"
}
```

### Button Order Best Practices

1. **Primary actions first** (Order Delivery, Order Pickup)
2. **Location second** (Get Directions)
3. **Contact third** (Call, WhatsApp)
4. **Info last** (Menu, Website, Reviews)
5. **Max 5-6 buttons total** (too many = overwhelming)

---

## Social Media Links

```javascript
social: {
    instagram: "https://instagram.com/restaurantname",
    facebook: "https://facebook.com/restaurantname",
    tiktok: "https://tiktok.com/@restaurantname",
    twitter: "https://twitter.com/restaurantname",
    youtube: "https://youtube.com/@restaurantname"
}
```

**Supported platforms:**
- Instagram
- Facebook
- TikTok
- Twitter
- YouTube

**To remove a platform:**
- Delete the line, or
- Set to `null`: `facebook: null`

**Pro tip:** Only include platforms the restaurant actively uses (3-4 max).

---

## Advanced Customization

### Change Font

Add Google Fonts in the `<head>` section:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
```

Then update the CSS:

```css
body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Add Background Pattern

```css
body {
    background-image: url('https://www.transparenttextures.com/patterns/asfalt-dark.png');
    background-repeat: repeat;
}
```

### Adjust Button Sizes

```css
.btn {
    padding: 20px 28px;  /* Larger buttons */
    font-size: 18px;
}
```

### Custom Logo Size (Minimal/Card)

```css
.layout-minimal .hero-image,
.layout-card .hero-image {
    width: 150px;   /* Larger logo */
    height: 150px;
}
```

---

## Testing

### Pre-Launch Checklist

- [ ] Restaurant name, tagline, location correct
- [ ] All button links work (click each one)
- [ ] Social media links work
- [ ] Colors match brand
- [ ] Logo/images load properly
- [ ] Looks good on mobile (most important!)
- [ ] Hours are accurate

### How to Test

#### Desktop:
1. Open HTML file in browser
2. Click all buttons
3. Check layout

#### Mobile:
1. Upload to test server
2. Open on your phone
3. Test all buttons
4. Check readability

#### Browser DevTools (Mobile Simulation):
1. Open in Chrome
2. Press F12
3. Click device toolbar icon
4. Select "iPhone 12 Pro"
5. Test layout

### Common Issues

**Images not loading:**
- Check URL is valid
- Use `https://` not `http://`
- Try opening image URL in new tab

**Buttons not working:**
- Check URL format (must start with `https://`, `tel:`, or `mailto:`)
- Test link in new tab first

**Colors look wrong:**
- Make sure hex codes start with `#`
- Use 6-digit hex codes (e.g., `#FF6B35` not `#F63`)

**Text hard to read:**
- Increase blur on background image
- Use darker overlay
- Change text color

---

## Next Steps

Once your link page is ready:

1. **Test thoroughly** (all buttons, mobile, desktop)
2. **Deploy** (see [Deployment Guide](DEPLOYMENT_GUIDE.md))
3. **Share with client** (get their approval)
4. **Add to Instagram bio** (replace their current link)
5. **Track performance** (monitor clicks, conversions)

---

## Support

Questions? Check the other docs:
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Template Comparison](TEMPLATE_COMPARISON.md)
- [Button Examples](BUTTON_EXAMPLES.md)

Or contact: [your email]
