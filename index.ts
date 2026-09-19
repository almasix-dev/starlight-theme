import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StarlightPlugin } from '@astrojs/starlight/types';

export type AlmasixThemeOptions = {
	/** GitHub `owner/repo` for the header chip (stars, forks, latest release). */
	github?: string;
	/** Product suffix next to the Almasix mark (e.g. `Orbit`, `Docs`). */
	product?: string;
	/** Hub URL for the Almasix wordmark link. Default: https://almasix.com */
	hubUrl?: string;
	/**
	 * Optional Astro component path (relative to the docs project root) rendered
	 * in the header between the GitHub chip and ThemeSelect (e.g. VersionSelect).
	 */
	headerExtras?: string;
	/**
	 * Optional Astro component path rendered under the header (e.g. VersionBanner).
	 */
	pageBanner?: string;
	/** Inject example-screenshot lightbox script. Default: true */
	lightbox?: boolean;
	/** Inject sidebar accordion script. Default: true */
	sidebarAccordion?: boolean;
};

export type AlmasixThemeConfig = {
	github: string | null;
	product: string | null;
	hubUrl: string;
	hasHeaderExtras: boolean;
	hasPageBanner: boolean;
};

const PKG_ROOT = path.dirname(fileURLToPath(import.meta.url));

function resolveProjectPath(root: string, rel: string | undefined): string | null {
	if (!rel) return null;
	return path.isAbsolute(rel) ? rel : path.resolve(root, rel);
}

function readScript(name: string): string {
	return readFileSync(path.join(PKG_ROOT, 'scripts', name), 'utf8');
}

const COMPONENT_SLOTS = [
	'Header',
	'PageFrame',
	'Pagination',
	'SiteTitle',
	'ThemeSelect',
	'TwoColumnContent',
] as const;

/**
 * Almasix Starlight theme plugin — cream paper, gruvbox code, GitHub chip,
 * breadcrumb prev/next, borderless columns.
 */
export default function almasixTheme(options: AlmasixThemeOptions = {}): StarlightPlugin {
	const lightbox = options.lightbox !== false;
	const sidebarAccordion = options.sidebarAccordion !== false;

	return {
		name: '@almasix/starlight-theme',
		hooks: {
			'config:setup'({ config, updateConfig, addIntegration, logger, astroConfig }) {
				const projectRoot = fileURLToPath(astroConfig.root);
				const headerExtrasAbs = resolveProjectPath(projectRoot, options.headerExtras);
				const pageBannerAbs = resolveProjectPath(projectRoot, options.pageBanner);

				const themeConfig: AlmasixThemeConfig = {
					github: options.github ?? null,
					product: options.product ?? null,
					hubUrl: options.hubUrl ?? 'https://almasix.com',
					hasHeaderExtras: Boolean(headerExtrasAbs),
					hasPageBanner: Boolean(pageBannerAbs),
				};

				addIntegration({
					name: '@almasix/starlight-theme-vite',
					hooks: {
						'astro:config:setup'({ updateConfig: updateAstro }) {
							updateAstro({
								vite: {
									plugins: [
										{
											name: 'almasix-starlight-theme-virtual',
											resolveId(id: string) {
												if (
													id === 'virtual:almasix-theme/config' ||
													id === 'virtual:almasix-theme/header-extras' ||
													id === 'virtual:almasix-theme/page-banner' ||
													id === '\0virtual:almasix-theme/config' ||
													id === '\0virtual:almasix-theme/header-extras' ||
													id === '\0virtual:almasix-theme/page-banner'
												) {
													return id.startsWith('\0') ? id : `\0${id}`;
												}
											},
											load(id: string) {
												if (id === '\0virtual:almasix-theme/config') {
													return `export default ${JSON.stringify(themeConfig)};`;
												}
												if (id === '\0virtual:almasix-theme/header-extras') {
													if (headerExtrasAbs) {
														const spec = JSON.stringify(headerExtrasAbs);
														return `export { default } from ${spec};`;
													}
													return `export { default } from ${JSON.stringify(path.join(PKG_ROOT, 'components/Empty.astro'))};`;
												}
												if (id === '\0virtual:almasix-theme/page-banner') {
													if (pageBannerAbs) {
														const spec = JSON.stringify(pageBannerAbs);
														return `export { default } from ${spec};`;
													}
													return `export { default } from ${JSON.stringify(path.join(PKG_ROOT, 'components/Empty.astro'))};`;
												}
											},
										},
									],
								},
							});
						},
					},
				});

				const components: Record<string, string> = { ...(config.components ?? {}) };
				for (const slot of COMPONENT_SLOTS) {
					if (components[slot]) {
						logger.warn(
							`Skipping ${slot} override — already set in Starlight config. Remove it to use @almasix/starlight-theme.`,
						);
						continue;
					}
					components[slot] = `@almasix/starlight-theme/components/${slot}.astro`;
				}

				const customCss = [
					'@almasix/starlight-theme/styles',
					...(config.customCss ?? []),
				];

				const head = [...(config.head ?? [])];
				const hasFonts = head.some(
					(h) =>
						h.tag === 'link' &&
						typeof h.attrs?.href === 'string' &&
						h.attrs.href.includes('fonts.googleapis.com'),
				);
				if (!hasFonts) {
					head.unshift(
						{
							tag: 'link',
							attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
						},
						{
							tag: 'link',
							attrs: {
								rel: 'preconnect',
								href: 'https://fonts.gstatic.com',
								crossorigin: true,
							},
						},
					);
				}
				if (sidebarAccordion) {
					head.push({ tag: 'script', content: readScript('sidebar-accordion.js') });
				}
				if (lightbox) {
					head.push({ tag: 'script', content: readScript('example-lightbox.js') });
				}

				const userEc = config.expressiveCode;
				const userThemes =
					userEc &&
					typeof userEc === 'object' &&
					!Array.isArray(userEc) &&
					'themes' in userEc
						? userEc.themes
						: undefined;

				const expressiveCode =
					userEc === false
						? false
						: {
								themes: userThemes ?? ['gruvbox-dark-hard'],
								useStarlightDarkModeSwitch: false,
								useStarlightUiThemeColors: false,
								emitExternalStylesheet: true,
								styleOverrides: {
									borderRadius: '0.85rem',
									borderWidth: '1px',
									codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
									codeFontSize: '0.9rem',
									codeBackground: '#1d2021',
									codeForeground: '#ebdbb2',
									frames: {
										shadowColor: 'rgba(0, 0, 0, 0.35)',
										editorBackground: '#1d2021',
										terminalBackground: '#1d2021',
									},
									...(typeof userEc === 'object' &&
									userEc &&
									!Array.isArray(userEc) &&
									userEc.styleOverrides
										? userEc.styleOverrides
										: {}),
								},
								...(typeof userEc === 'object' && userEc && !Array.isArray(userEc)
									? Object.fromEntries(
											Object.entries(userEc).filter(
												([k]) =>
													![
														'themes',
														'useStarlightDarkModeSwitch',
														'useStarlightUiThemeColors',
														'emitExternalStylesheet',
														'styleOverrides',
													].includes(k),
											),
										)
									: {}),
							};

				updateConfig({
					components,
					customCss,
					head,
					expressiveCode,
				});
			},
		},
	};
}
