// The repo these components are documented from. `source` paths in `StoryMeta` are
// relative to the monorepo root and resolved against this base on the default branch.
const REPO_BASE = 'https://github.com/clerk/javascript';
const BRANCH = 'main';

/**
 * Build a GitHub URL from a repo-root-relative path. Index/barrel files (`index.ts`,
 * `index.tsx`, …) resolve to their containing folder as a `tree` view — the folder of
 * source files is more useful than the re-export file. Any other path links straight
 * to the file as a `blob` view.
 */
export function sourceUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  const folder = clean.match(/^(.*)\/index\.[jt]sx?$/)?.[1];
  return folder ? `${REPO_BASE}/tree/${BRANCH}/${folder}` : `${REPO_BASE}/blob/${BRANCH}/${clean}`;
}
