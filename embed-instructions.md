# Ghost Embedding Instructions

## Option 1 — Paste HTML directly (simplest)

In Ghost editor, add a **HTML card** and paste the full contents of `grant-finder.html` directly into it.

Works best for Ghost (Pro) and self-hosted Ghost with no CSP restrictions.

---

## Option 2 — iframe (recommended for self-hosted)

Host `grant-finder.html` on any static file server, CDN, or GitHub Pages, then embed via Ghost HTML card:

```html
<iframe
  src="https://your-domain.com/grant-finder.html"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none; border-radius:12px;"
  title="UK Landlord Grant Finder"
></iframe>
```

For a responsive height that auto-adjusts, add this script after the iframe:

```html
<script>
  window.addEventListener('message', function(e) {
    var iframe = document.querySelector('iframe[title="UK Landlord Grant Finder"]');
    if (iframe && e.data && e.data.height) {
      iframe.style.height = e.data.height + 'px';
    }
  });
</script>
```

And inside `grant-finder.html`, add this at the bottom of the `<script>` block:

```js
function postHeight() {
  window.parent.postMessage({ height: document.body.scrollHeight }, '*');
}
setInterval(postHeight, 500);
```

---

## Option 3 — GitHub Pages (free hosting)

1. Create a repo (e.g. `landlord-grants`)
2. Push `grant-finder.html` as `index.html`
3. Enable GitHub Pages in repo settings
4. Use the resulting URL in an iframe as above

---

## Customising the colour scheme

Edit the CSS variables at the top of the `<style>` block:

```css
--brand:      #1a6e45;   /* primary green */
--brand-light:#e8f5ee;   /* light tint */
--brand-dark: #134f32;   /* hover state */
--accent:     #f0a500;   /* amber accent */
```

Change `--brand` to match your Ghost theme's primary colour.
