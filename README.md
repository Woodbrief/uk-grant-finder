# UK Property Grant Finder

A free, independent research tool that signposts publicly available UK grant schemes for property works across England, Scotland, Wales, and Northern Ireland.

**Live tool:** [Deploy to GitHub Pages — see deploy instructions below]

---

## What this is

This is a static web application (no build step, no server required) that helps property owners and managers identify grant and funding schemes that may be relevant to their property. It does not assess eligibility or provide advice.

Every scheme entry links directly to its official source. All entries carry a "last verified" date and a source attribution.

**Persistent disclaimer shown to all users:**
> This is a free research tool that signposts publicly available UK grant schemes. It does not assess eligibility or provide advice. Always verify current eligibility, funding levels, and deadlines on the official scheme page before acting.

---

## Features

- **Eligibility wizard** — 6-step guided flow (country, property type, tenure, EPC rating, planned works, tenant circumstances) producing a scored list of potentially relevant schemes
- **Browse mode** — filterable, searchable list of all 23+ catalogued schemes with URL query-string persistence
- **Scheme detail cards** — expandable cards showing eligibility summary, how-to-apply steps, funding notes, source link, and last-verified date
- **Modal detail view** — full scheme detail with prominent official URL
- **Embed support** — auto-resizing iframe widget for embedding in Ghost or any HTML page
- Zero-results fallback with links to GOV.UK and local council finder

---

## Repository structure

```
uk-grant-finder/
├── index.html              # Main single-page application
├── about.html              # About page (methodology, operator background)
├── assets/
│   ├── styles.css          # Mobile-first CSS with custom properties
│   └── app.js              # Vanilla ES2020 — no framework, no build step
├── data/
│   ├── grants.json         # All scheme data (23 entries)
│   └── schema.md           # Data schema documentation
├── embed/
│   ├── iframe-snippet.html # Ghost/HTML embed code snippets
│   └── widget.js           # Auto-resizing iframe widget
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deploy on push to main
├── LICENSE                 # MIT
└── .gitignore
```

---

## Deploying to GitHub Pages

1. Fork or clone this repository
2. Go to **Settings → Pages** in your GitHub repo
3. Set source to **GitHub Actions**
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` handles the rest

The site deploys to `https://<your-username>.github.io/<repo-name>/`.

---

## Embedding in Ghost (or any HTML page)

See `embed/iframe-snippet.html` for ready-to-paste snippets. The auto-resizing version uses `postMessage` to adjust the iframe height as users navigate the wizard.

**Method 1 — Fixed height (simplest):**
```html
<iframe
  src="https://your-username.github.io/uk-grant-finder/"
  width="100%"
  height="900"
  frameborder="0"
  style="border:none;border-radius:12px;display:block;"
  title="UK Property Grant Finder"
  loading="lazy"
></iframe>
```

**Method 2 — Auto-resizing (recommended for Ghost):**
```html
<div id="grant-finder"></div>
<script src="https://your-username.github.io/uk-grant-finder/embed/widget.js"></script>
```

Replace `your-username` and the repo name with your actual GitHub Pages URL.

---

## Scheme data

All schemes are in `data/grants.json`. The schema is documented in `data/schema.md`.

Schemes catalogued (23 total):

| # | Name | Category | Countries |
|---|------|----------|-----------|
| 1 | ECO4 | Retrofit | England, Scotland, Wales |
| 2 | Great British Insulation Scheme | Retrofit | England, Scotland, Wales |
| 3 | Boiler Upgrade Scheme | Retrofit | England, Wales |
| 4 | Warm Homes: Local Grant | Retrofit | England |
| 5 | Warm Homes: Social Housing Fund | Retrofit | England |
| 6 | Home Energy Scotland | Retrofit | Scotland |
| 7 | Nest Wales | Retrofit | Wales |
| 8 | NI Sustainable Energy Programme | Retrofit | Northern Ireland |
| 9 | Disabled Facilities Grant (England) | Adaptation | England |
| 10 | Scheme of Assistance (Scotland) | Adaptation | Scotland |
| 11 | Enable / Rapid Response Adaptations (Wales) | Adaptation | Wales |
| 12 | Disabled Facilities Grant (Northern Ireland) | Adaptation | Northern Ireland |
| 13 | Empty Homes Grant (Wales) | Empty Homes | Wales |
| 14 | Scotland Empty Homes Partnership | Empty Homes | Scotland |
| 15 | Historic England Repair Grants | Heritage | England |
| 16 | National Lottery Heritage Fund | Heritage | UK-wide |
| 17 | Listed Places of Worship Grant Scheme | Heritage | UK-wide |
| 18 | Affordable Homes Programme 2021–26 | Affordable Housing | England |
| 19 | Social and Affordable Homes Programme 2026–36 | Affordable Housing | England |
| 20 | Smart Export Guarantee | Retrofit | England, Scotland, Wales |
| 21 | Industrial Energy Transformation Fund | Retrofit | England |
| 22 | Home Upgrade Grant Phase 2 (HUG2) | Retrofit | England |
| 23 | GLA Affordable Homes Programme | Affordable Housing | England (London) |

---

## Methodology

Scheme data is compiled from official UK government, regulator, and devolved administration websites. Each entry records:

- The official scheme URL as the primary source
- A `lastVerified` date (YYYY-MM format) indicating when the entry was last checked against the official source
- A `verify: true` flag on entries where specific figures or details could not be confirmed and should be verified before use

This tool does not independently verify eligibility for any scheme. The matching logic in the wizard is a relevance-scoring heuristic, not an eligibility determination. Users must always verify on the official scheme page.

---

## Contributing / corrections

If you find an error in a scheme entry — a changed URL, updated funding figure, or closed programme — please [open a GitHub issue](../../issues) with the scheme name, the error, and a link to the official source.

Pull requests are welcome for:
- Correcting existing scheme data
- Adding new schemes (with official URL and source attribution)
- Accessibility or usability improvements

Please do not submit PRs that add advisory language or eligibility assessments.

---

## About the operator

This project is maintained by an independent researcher with a background in sustainability and environmental regulation (MSc sustainability; work in packaging and environmental regulation; forthcoming book on practical sustainability). The operator is not a property professional, housing advisor, or grant specialist. This tool is a research and signposting resource, not a professional service.

---

## Licence

MIT — see `LICENSE`.

Scheme data sourced from official UK government and regulator websites is subject to the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
