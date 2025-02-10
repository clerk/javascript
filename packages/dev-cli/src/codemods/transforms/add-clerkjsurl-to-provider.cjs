const CLERK_JS_URL_PROP = 'clerkJSUrl';
const CLERK_JS_URL = 'http://localhost:4000/npm/clerk.browser.js';

/**
 *
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const clerkProvider = root.findJSXElements('ClerkProvider');

  if (clerkProvider.size() > 0) {
    clerkProvider.forEach(clerkProviderElement => {
      const attrs = clerkProviderElement.get('attributes');
      const hasClerkJSUrlProp = attrs.value.some(n => n.name.name === CLERK_JS_URL_PROP);
      if (hasClerkJSUrlProp) {
        for (const attr of attrs.value) {
          if (attr.name.name === CLERK_JS_URL_PROP) {
            attr.value = j.literal(CLERK_JS_URL);
          }
        }
      } else {
        attrs.push(j.jsxAttribute(j.jsxIdentifier(CLERK_JS_URL_PROP), j.literal(CLERK_JS_URL)));
      }
    });
  }

  return root.toSource();
};
