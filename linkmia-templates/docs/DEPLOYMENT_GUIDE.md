# Deployment Guide

How to deploy LinkMia link pages to the web.

---

## Deployment Options

| Option | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| **GitHub Pages** | Free | Easy | Testing, multiple clients |
| **Netlify** | Free | Very Easy | Quick deploys, custom domains |
| **Vercel** | Free | Easy | Fast CDN, custom domains |
| **Custom Domain** | $10-15/year | Medium | Professional branding |

---

## Option 1: GitHub Pages (Recommended for Starting)

### Pros:
- ✅ Free
- ✅ Easy to update
- ✅ Version control
- ✅ Can host multiple clients in one repo

### Cons:
- ❌ URL is `yourusername.github.io/repo-name/file.html`
- ❌ Requires GitHub account

### Setup Steps:

#### 1. Create Repository

```bash
cd /home/ubuntu/linkmia-templates

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: LinkMia templates"

# Create GitHub repo
gh repo create linkmia-templates --public --source=. --remote=origin

# Push
git push -u origin main
```

#### 2. Enable GitHub Pages

```bash
# Enable Pages
gh repo edit --enable-pages --pages-branch main

# Or do it manually:
# 1. Go to repo Settings
# 2. Scroll to "Pages"
# 3. Source: Deploy from branch "main"
# 4. Folder: / (root)
# 5. Save
```

#### 3. Access Your Pages

Your templates will be available at:
```
https://yourusername.github.io/linkmia-templates/examples/elpaisa-minimal.html
https://yourusername.github.io/linkmia-templates/examples/elpaisa-hero.html
https://yourusername.github.io/linkmia-templates/examples/elpaisa-card.html
```

#### 4. Add New Clients

```bash
# Add new client file
cp templates/hero/index.html tropicotacos.html

# Edit tropicotacos.html with their info

# Commit and push
git add tropicotacos.html
git commit -m "Add Tropico Tacos"
git push

# Available at:
# https://yourusername.github.io/linkmia-templates/tropicotacos.html
```

---

## Option 2: Netlify (Easiest, Most Professional)

### Pros:
- ✅ Free
- ✅ Super fast CDN
- ✅ Custom domains supported
- ✅ Drag & drop deployment
- ✅ Automatic HTTPS

### Cons:
- ❌ Requires Netlify account

### Setup Steps:

#### Method A: Drag & Drop (Fastest)

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Click "Add new site" → "Deploy manually"
4. Drag your HTML file into the box
5. Done! You get a URL like `random-name-123.netlify.app`

#### Method B: Connect to GitHub (Better for Updates)

1. Push your templates to GitHub (see Option 1)
2. Go to Netlify
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select your `linkmia-templates` repo
6. Deploy!

**Every time you push to GitHub, Netlify auto-deploys.**

#### Add Custom Domain

1. Buy domain (e.g., `linkmia.com`)
2. In Netlify: Site settings → Domain management
3. Add custom domain
4. Update DNS records (Netlify provides instructions)
5. Done! Your site is at `linkmia.com`

#### Subdomains for Each Client

1. In Netlify: Domain management → Add domain alias
2. Add: `elpaisa.linkmia.com`
3. Update DNS: Add CNAME record pointing to Netlify
4. Repeat for each client

---

## Option 3: Vercel (Similar to Netlify)

### Pros:
- ✅ Free
- ✅ Very fast
- ✅ Custom domains
- ✅ GitHub integration

### Cons:
- ❌ Requires Vercel account

### Setup Steps:

1. Push to GitHub (see Option 1)
2. Go to [vercel.com](https://vercel.com)
3. Sign up (free)
4. Click "Add New" → "Project"
5. Import from GitHub
6. Select repo
7. Deploy!

**Same as Netlify, but different platform.**

---

## Option 4: Custom Domain + Hosting

### Pros:
- ✅ Full control
- ✅ Professional URLs
- ✅ Can use subdomains

### Cons:
- ❌ Costs money ($10-15/year for domain + hosting)
- ❌ More technical setup

### Setup Steps:

#### 1. Buy Domain

Recommended registrars:
- **Namecheap** ($8-12/year)
- **Google Domains** ($12/year)
- **Cloudflare** ($8-10/year)

Example: `linkmia.com`

#### 2. Get Hosting

Options:
- **Shared hosting** (Bluehost, HostGator) — $3-5/month
- **VPS** (DigitalOcean, Linode) — $5-10/month
- **Cloudflare Pages** (Free!)

#### 3. Upload Files

Via FTP/SFTP:
```bash
# Using scp
scp elpaisa.html user@yourserver.com:/var/www/html/

# Or use FileZilla (GUI)
```

#### 4. Set Up Subdomains

In your domain's DNS settings:

```
A Record:
  @ → Your server IP

CNAME Records:
  elpaisa → yourdomain.com
  tropicotacos → yourdomain.com
  miamibites → yourdomain.com
```

Then configure your web server (Apache/Nginx) to serve files:

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^elpaisa\.linkmia\.com$
RewriteRule ^$ /elpaisa.html [L]
```

**Nginx:**
```nginx
server {
    server_name elpaisa.linkmia.com;
    root /var/www/html;
    index elpaisa.html;
}
```

---

## Recommended Workflow

### Phase 1: Testing (Use GitHub Pages)
- Deploy to GitHub Pages
- Share links with clients for approval
- Make changes, push updates
- Free and easy

### Phase 2: First 5 Clients (Use Netlify)
- Connect GitHub to Netlify
- Auto-deploy on every push
- Use Netlify subdomains: `elpaisa.netlify.app`
- Still free

### Phase 3: Scaling (Buy Domain)
- Buy `linkmia.com`
- Set up subdomains for each client
- Professional URLs: `elpaisa.linkmia.com`
- Costs $10-15/year

---

## URL Structures

### GitHub Pages
```
yourusername.github.io/linkmia-templates/elpaisa.html
yourusername.github.io/linkmia-templates/tropicotacos.html
```

**Pros:** Free, easy
**Cons:** Long URLs, not branded

### Netlify (Free Subdomain)
```
elpaisa.netlify.app
tropicotacos.netlify.app
```

**Pros:** Shorter, professional
**Cons:** Still has "netlify" in URL

### Custom Domain
```
elpaisa.linkmia.com
tropicotacos.linkmia.com
```

**Pros:** Fully branded, professional
**Cons:** Costs money

---

## Updating Live Sites

### GitHub Pages / Netlify / Vercel:

```bash
# Edit your file
nano elpaisa.html

# Commit and push
git add elpaisa.html
git commit -m "Update El Paisa buttons"
git push

# Site updates automatically (1-2 minutes)
```

### Manual Hosting:

```bash
# Upload via FTP/SFTP
scp elpaisa.html user@server:/var/www/html/

# Or use FileZilla
```

---

## SSL / HTTPS

### GitHub Pages
- ✅ Automatic HTTPS

### Netlify / Vercel
- ✅ Automatic HTTPS
- ✅ Works with custom domains

### Custom Hosting
- Use **Let's Encrypt** (free SSL)
- Or **Cloudflare** (free SSL + CDN)

---

## Performance Tips

### Optimize Images

```bash
# Compress images before uploading
# Use tools like:
# - TinyPNG.com
# - Squoosh.app
# - ImageOptim (Mac)
```

### Use CDN

- Netlify/Vercel have built-in CDN
- For custom hosting, use Cloudflare (free)

### Enable Caching

Add to HTML `<head>`:
```html
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

---

## Troubleshooting

### Site Not Loading
- Check DNS propagation (can take 24-48 hours)
- Verify files are in correct directory
- Check file permissions (644 for HTML files)

### Images Not Showing
- Use absolute URLs: `https://...`
- Check image URLs in browser
- Verify CORS if using external images

### Custom Domain Not Working
- Check DNS records (use [dnschecker.org](https://dnschecker.org))
- Wait for propagation (up to 48 hours)
- Verify SSL certificate is active

---

## Next Steps

After deploying:

1. **Test the live site** (all buttons, mobile, desktop)
2. **Share with client** (get approval)
3. **Add to Instagram bio** (replace their current link)
4. **Set up analytics** (track clicks)
5. **Monitor performance** (check load times)

---

## Support

Questions about deployment?
- Check [Netlify docs](https://docs.netlify.com)
- Check [GitHub Pages docs](https://docs.github.com/en/pages)
- Contact: [your email]
