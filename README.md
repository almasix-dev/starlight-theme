# @almasix/starlight-theme

Shared [Astro Starlight](https://starlight.astro.build/) theme for Almasix documentation sites.

- Warm cream light paper (`#FFF1E3`) + warm dark neutrals
- Always-dark **gruvbox-dark-hard** code blocks (Filament docs parity)
- Borderless sidebar / main / TOC columns
- Nested sidebar groups use normal weight (top-level groups stay bold)
- Header GitHub chip (latest release · stars · forks)
- Prev/next links with group breadcrumbs (`Tables · Columns · Overview`)
- Theme cycle control + sidebar accordion + optional screenshot lightbox

## Requirements

- Node.js **≥ 22**
- [`@astrojs/starlight`](https://www.npmjs.com/package/@astrojs/starlight) `^0.42`
- [`astro`](https://www.npmjs.com/package/astro) `^5` or `^7`

## Install

```bash
npm install @almasix/starlight-theme
```

Also install the peers if your project does not already have them:

```bash
npm install astro @astrojs/starlight
```

## Setup

### 1. Register the plugin

In `astro.config.mjs`, import the plugin and add it under Starlight `plugins`. Do **not** override `Header`, `PageFrame`, `Pagination`, `SiteTitle`, `ThemeSelect`, or `TwoColumnContent` — the theme owns those slots.

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import almasixTheme from '@almasix/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Orbit',
      logo: {
        light: './src/assets/almasix-banner-light.svg',
        dark: './src/assets/almasix-banner-dark.svg',
        alt: 'Almasix',
        replacesTitle: true,
      },
      plugins: [
        almasixTheme({
          github: 'almasix-dev/almasix-orbit',
          product: 'Orbit',
          hubUrl: 'https://almasix.com',
        }),
      ],
      // Site-specific CSS only — theme CSS is injected automatically.
      customCss: ['./src/styles/landing.css'],
      // Optional local overrides (Hero is fine; chrome slots are not):
      components: {
        Hero: './src/components/Hero.astro',
      },
    }),
  ],
});
```

Minimal config (defaults for `hubUrl`, lightbox, and sidebar accordion):

```js
plugins: [almasixTheme({ github: 'almasix-dev/your-repo', product: 'Docs' })],
```

### 2. Brand banners

The site title renders logos from **`public/`** (so “Open image in new tab” works), while Starlight’s `logo` config still needs matching assets for layout/alt:

| Role | Path |
|------|------|
| Light mode mark | `public/almasix-banner-light.svg` |
| Dark mode mark | `public/almasix-banner-dark.svg` |
| Starlight `logo.light` / `logo.dark` | e.g. `./src/assets/almasix-banner-*.svg` (same files copied or symlinked) |

Use dual light/dark logos with `replacesTitle: true` and `alt: 'Almasix'`.

### 3. Optional header extras and page banner

Keep version switchers, deprecation banners, and other site-specific chrome in your docs repo. Point the plugin at them with project-relative paths:

```js
almasixTheme({
  github: 'almasix-dev/almasix-orbit',
  product: 'Orbit',
  hubUrl: 'https://almasix.com',
  headerExtras: './src/components/VersionSelect.astro', // after GitHub chip
  pageBanner: './src/components/VersionBanner.astro',   // under header
}),
```

If omitted, those slots render nothing.

### 4. What the plugin configures for you

| Concern | Behavior |
|---------|----------|
| Theme CSS | Prepended as `@almasix/starlight-theme/styles` |
| Chrome components | The six slots listed above |
| Code blocks | `gruvbox-dark-hard`, no light/dark theme switch on code |
| Fonts | Google Fonts preconnect links (skipped if you already add them) |
| Sidebar accordion | On by default (`sidebarAccordion: false` to disable) |
| Screenshot lightbox | On by default (`lightbox: false` to disable) |

Your `customCss`, `head`, and non-chrome `components` (e.g. `Hero`) are merged in after the theme.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `github` | — | `owner/repo` for the header chip (stars, forks, latest release) |
| `product` | from Starlight `title` | Suffix next to the Almasix mark (`ORBIT`, `DOCS`, …) |
| `hubUrl` | `https://almasix.com` | Wordmark link target |
| `headerExtras` | — | Project-relative Astro component after the GitHub chip |
| `pageBanner` | — | Project-relative Astro component under the header |
| `lightbox` | `true` | Inject example-screenshot lightbox script |
| `sidebarAccordion` | `true` | Keep one sidebar group open at a time |

## Publishing (maintainers)

Releases use [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) — no `NPM_TOKEN` secret. CI authenticates with a short-lived OIDC token.

**npmjs.com (one-time):** package **Settings → Trusted Publisher → GitHub Actions** with Organization `almasix-dev`, Repository `starlight-theme`, Workflow `publish.yml` (Environment empty; allow `npm publish`).

**Release:**

```bash
# Bump version in package.json so it matches the tag without "v"
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

Pushing `v*` runs [`.github/workflows/publish.yml`](.github/workflows/publish.yml).

## License

MIT
