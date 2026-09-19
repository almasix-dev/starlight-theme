# @almasix/starlight-theme

Shared [Astro Starlight](https://starlight.astro.build/) theme for Almasix documentation sites.

- Warm cream light paper (`#FFF1E3`) + warm dark neutrals
- Always-dark **gruvbox-dark-hard** code blocks (Filament docs parity)
- Borderless sidebar / main / TOC columns
- Nested sidebar groups use normal weight (top-level groups stay bold)
- Header GitHub chip (latest release · stars · forks)
- Prev/next links with group breadcrumbs (`Tables · Columns · Overview`)
- Theme cycle control + sidebar accordion + optional screenshot lightbox

## Install

```bash
npm install @almasix/starlight-theme
```

Peer deps: `@astrojs/starlight` ^0.42, `astro` ^5 or ^7, Node ≥ 22.

## Usage

```js
// astro.config.mjs
import starlight from '@astrojs/starlight';
import almasixTheme from '@almasix/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Orbit',
      plugins: [
        almasixTheme({
          github: 'almasix-dev/almasix-orbit',
          product: 'Orbit',
          hubUrl: 'https://almasix.com',
          // Optional — version switcher / banner stay in your repo:
          headerExtras: './src/components/VersionSelect.astro',
          pageBanner: './src/components/VersionBanner.astro',
        }),
      ],
      logo: {
        light: './src/assets/almasix-banner-light.svg',
        dark: './src/assets/almasix-banner-dark.svg',
        alt: 'Almasix',
        replacesTitle: true,
      },
      // Put banners in public/ as almasix-banner-{light,dark}.svg
      customCss: ['./src/styles/landing.css'], // site-specific only
      // Do NOT re-declare Header/PageFrame/Pagination/… — the plugin owns those.
    }),
  ],
});
```

Serve brand banners from `public/almasix-banner-light.svg` and `public/almasix-banner-dark.svg`.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `github` | — | `owner/repo` for the header chip |
| `product` | from `title` | Suffix next to the Almasix mark |
| `hubUrl` | `https://almasix.com` | Wordmark link |
| `headerExtras` | — | Project-relative Astro component after the chip |
| `pageBanner` | — | Project-relative Astro component under the header |
| `lightbox` | `true` | Inject example-screenshot lightbox script |
| `sidebarAccordion` | `true` | One open sidebar group at a time |

## Publishing (npm Trusted Publishing)

Releases use [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) — no `NPM_TOKEN` in GitHub secrets. CI authenticates with a short-lived OIDC token.

### One-time: configure npmjs.com

1. Open [npmjs.com/package/@almasix/starlight-theme](https://www.npmjs.com/package/@almasix/starlight-theme) → **Settings** → **Trusted Publisher**.
2. Add **GitHub Actions** with exactly:

   | Field | Value |
   |-------|--------|
   | Organization or user | `almasix-dev` |
   | Repository | `starlight-theme` |
   | Workflow filename | `publish.yml` |
   | Environment | _(leave empty)_ |
   | Allowed actions | enable **`npm publish`** |

   Values are case-sensitive. npm does **not** validate them until the first CI publish.

3. Optional hardening after the first successful CI publish: **Publishing access** → require 2FA and disallow classic tokens.

### Release a new version

```bash
# 1. Bump version in package.json (must match the tag without "v")
# 2. Commit, then:
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

Pushing `v*` runs [`.github/workflows/publish.yml`](.github/workflows/publish.yml), which checks the tag matches `package.json` and runs `npm publish` via OIDC.

## License

MIT
