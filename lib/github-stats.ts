/** Build-time GitHub repo stats for the docs header chip. */

export type GitHubStats = {
	stars: number | null;
	forks: number | null;
	release: string | null;
	repoUrl: string;
	releasesUrl: string;
};

const cache = new Map<string, GitHubStats>();

async function fetchJson(url: string): Promise<unknown | null> {
	try {
		const res = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'almasix-starlight-theme',
			},
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

export async function getGitHubStats(repo: string | null | undefined): Promise<GitHubStats> {
	const fallback: GitHubStats = {
		stars: null,
		forks: null,
		release: null,
		repoUrl: repo ? `https://github.com/${repo}` : 'https://github.com/almasix-dev',
		releasesUrl: repo
			? `https://github.com/${repo}/releases`
			: 'https://github.com/almasix-dev',
	};

	if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
		return fallback;
	}

	const hit = cache.get(repo);
	if (hit) return hit;

	const [repoJson, releaseJson] = await Promise.all([
		fetchJson(`https://api.github.com/repos/${repo}`),
		fetchJson(`https://api.github.com/repos/${repo}/releases/latest`),
	]);

	const stats: GitHubStats = { ...fallback };

	if (repoJson && typeof repoJson === 'object') {
		const r = repoJson as Record<string, unknown>;
		if (typeof r.stargazers_count === 'number') stats.stars = r.stargazers_count;
		if (typeof r.forks_count === 'number') stats.forks = r.forks_count;
	}

	if (releaseJson && typeof releaseJson === 'object') {
		const rel = releaseJson as Record<string, unknown>;
		if (typeof rel.tag_name === 'string' && rel.tag_name) {
			stats.release = rel.tag_name;
		}
	}

	cache.set(repo, stats);
	return stats;
}

export function formatCount(n: number): string {
	if (n >= 1000) {
		const k = n / 1000;
		return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
	}
	return String(n);
}
