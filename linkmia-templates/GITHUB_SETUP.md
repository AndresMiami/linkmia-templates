# GitHub Setup Guide

**Quick guide to push this repository to GitHub and enable GitHub Pages.**

---

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Git configured with your name and email

---

## Step 1: Initialize Git Repository

```bash
cd /home/ubuntu/linkmia-templates

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: LinkMia restaurant link page templates"
```

---

## Step 2: Create GitHub Repository

```bash
# Create public repository and push
gh repo create linkmia-templates --public --source=. --remote=origin --push
```

**Or create private repository:**
```bash
gh repo create linkmia-templates --private --source=. --remote=origin --push
```

---

## Step 3: Enable GitHub Pages

```bash
# Enable GitHub Pages from main branch
gh repo edit --enable-pages --pages-branch main
```

**Wait 1-2 minutes for deployment**, then your templates will be available at:

```
https://YOUR_USERNAME.github.io/linkmia-templates/
```

---

## Step 4: Access Your Templates

### Example Pages:
- `https://YOUR_USERNAME.github.io/linkmia-templates/examples/elpaisa-minimal.html`
- `https://YOUR_USERNAME.github.io/linkmia-templates/examples/elpaisa-hero.html`
- `https://YOUR_USERNAME.github.io/linkmia-templates/examples/elpaisa-card.html`

### Templates (for copying):
- `https://YOUR_USERNAME.github.io/linkmia-templates/templates/minimal/index.html`
- `https://YOUR_USERNAME.github.io/linkmia-templates/templates/hero/index.html`
- `https://YOUR_USERNAME.github.io/linkmia-templates/templates/card/index.html`

---

## Step 5: Add New Clients

```bash
# Copy template
cp templates/hero/index.html tropicotacos.html

# Edit tropicotacos.html with client info

# Commit and push
git add tropicotacos.html
git commit -m "Add Tropico Tacos client page"
git push

# Available at:
# https://YOUR_USERNAME.github.io/linkmia-templates/tropicotacos.html
```

---

## Troubleshooting

### GitHub Pages Not Working

**Check deployment status:**
```bash
gh repo view --web
# Go to Settings → Pages
```

**Common issues:**
- Pages not enabled → Enable in Settings
- Wrong branch → Should be "main"
- Wrong folder → Should be "/" (root)
- Wait 2-3 minutes for first deployment

### Permission Denied

```bash
# Re-authenticate GitHub CLI
gh auth login
```

### Can't Push

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/linkmia-templates.git (fetch)
# origin  https://github.com/YOUR_USERNAME/linkmia-templates.git (push)

# If not, add remote:
git remote add origin https://github.com/YOUR_USERNAME/linkmia-templates.git
```

---

## Next Steps

1. **Test the live examples** — Open the GitHub Pages URLs
2. **Share with clients** — Send them the example links
3. **Create client pages** — Use the generator script or copy templates
4. **Deploy** — Push to GitHub, auto-deploys to Pages

---

## Alternative: Manual GitHub Setup

If `gh` CLI doesn't work:

1. Go to [github.com/new](https://github.com/new)
2. Create repository: `linkmia-templates`
3. Copy the commands GitHub shows:

```bash
git remote add origin https://github.com/YOUR_USERNAME/linkmia-templates.git
git branch -M main
git push -u origin main
```

4. Go to Settings → Pages
5. Source: Deploy from branch "main", folder "/"
6. Save

---

## Done!

Your templates are now live on GitHub Pages. 🎉

View your repo: `gh repo view --web`
