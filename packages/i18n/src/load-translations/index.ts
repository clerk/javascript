import type { I18n } from '../create-i18n';
import { translationsLoading } from '../translations-loading';
import type { ReadableStore } from '../types';

/**
 * Await any in-flight locale load for a message store's `i18n` instance, then
 * return the resolved snapshot. For server-only rendering (no client hydration):
 *
 * ```tsx
 * const t = await loadTranslations(i18n('post', postBase));
 * return <span>{t.title}</span>;
 * ```
 */
export async function loadTranslations<T>(messages: ReadableStore<T> & { i18n: I18n }): Promise<T> {
  await translationsLoading(messages.i18n);
  return messages.get();
}
