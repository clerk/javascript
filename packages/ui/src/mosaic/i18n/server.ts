// Locale bundles shipped by @clerk/ui. Add an entry here as each locale lands.
const LOADERS: Record<string, () => Promise<{ default: Record<string, Record<string, unknown>> }>> = {
  fr: () => import('../locales/fr.json'),
};

const DEFAULT_LOCALE = 'en';

function negotiate(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const available = new Set([...Object.keys(LOADERS), DEFAULT_LOCALE]);
  for (const entry of acceptLanguage.split(',')) {
    const lang = entry.split(';')[0].trim();
    for (const candidate of [lang, lang.split('-')[0]]) {
      if (available.has(candidate)) return candidate;
    }
  }
  return DEFAULT_LOCALE;
}

export type Localization = {
  locale: string;
  initialMessages: Record<string, Record<string, Record<string, unknown>>>;
};

/**
 * Resolve a locale and pre-load its message bundle from the Accept-Language header.
 * Drop the result straight into <MosaicProvider localization={...} />.
 *
 * Works in any server environment — pass whatever string your framework exposes:
 *   Next.js:  getLocalization((await headers()).get('accept-language'))
 *   Remix:    getLocalization(request.headers.get('accept-language'))
 *   Express:  getLocalization(req.get('accept-language') ?? null)
 */
export async function getLocalization(acceptLanguage: string | null): Promise<Localization> {
  const locale = negotiate(acceptLanguage);
  const loader = LOADERS[locale];
  if (!loader) return { locale, initialMessages: {} };
  const messages = (await loader()).default;
  return { locale, initialMessages: { [locale]: messages } };
}
