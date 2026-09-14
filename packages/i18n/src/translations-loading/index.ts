import type { I18n } from '../create-i18n';

/**
 * Await the next moment an `i18n` instance is not loading; resolves immediately
 * when nothing is in flight. Per-instance (unlike the global `allTasks`), so it
 * waits only for this instance's locale loads — the right granularity for
 * concurrent SSR.
 */
export function translationsLoading(i18n: I18n): Promise<void> {
  if (!i18n.loading.get()) {
    return Promise.resolve();
  }
  return new Promise<void>(resolve => {
    const unbind = i18n.loading.listen(loading => {
      if (!loading) {
        unbind();
        resolve();
      }
    });
  });
}
