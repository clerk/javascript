// The repo these components are documented from. `source` paths in `StoryMeta` are
// relative to the monorepo root and resolved against this base on the default branch.
const REPO_BLOB_BASE = 'https://github.com/clerk/javascript/blob/main';

/** Build a GitHub URL to the file that exports a component, from a repo-root-relative path. */
export function sourceUrl(path: string): string {
  return `${REPO_BLOB_BASE}/${path.replace(/^\/+/, '')}`;
}
