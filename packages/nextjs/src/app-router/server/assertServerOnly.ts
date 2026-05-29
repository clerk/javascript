export function assertServerOnly() {
  if (typeof require === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('server-only');
  }
}
