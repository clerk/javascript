// @ts-check - Enable TypeScript checks for safer MDX post-processing and link rewriting
import { Converter, DeclarationReflection, ReflectionKind, ReflectionType, RendererEvent } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Docs-relative links to be replaced in the generated MDX files.
 * Each entry is a tuple where the first element is the file name and the second element is the new path.
 * Ideally this is a temporary solution until every one of these files are published in production and can be linked to.
 */
const LINK_REPLACEMENTS = [
  ['set-active-params', '/docs/reference/types/set-active-params'],
  ['clerk-paginated-response', '/docs/reference/types/clerk-paginated-response'],
  ['paginated-resources', '#paginated-resources'],
  ['use-checkout-options', '#use-checkout-options'],
  ['needs-reverification-parameters', '#needs-reverification-parameters'],
  ['create-organization-params', '#create-organization-params'],
  ['session-resource', '/docs/reference/objects/session'],
  ['signed-in-session-resource', '/docs/reference/objects/session'],
  ['sign-in-resource', '/docs/reference/objects/sign-in'],
  ['sign-in-future-resource', '/docs/reference/objects/sign-in-future'],
  ['sign-in-errors', '/docs/reference/types/errors'],
  ['sign-up-resource', '/docs/reference/objects/sign-up'],
  ['sign-up-future-resource', '/docs/reference/objects/sign-up-future'],
  ['sign-up-errors', '/docs/reference/types/errors'],
  ['user-resource', '/docs/reference/objects/user'],
  ['session-status-claim', '/docs/reference/types/session-status'],
  ['user-organization-invitation-resource', '/docs/reference/types/user-organization-invitation'],
  ['organization-custom-role-key', '/docs/reference/types/organization-custom-role-key'],
  ['organization-membership-resource', '/docs/reference/types/organization-membership'],
  ['organization-suggestion-resource', '/docs/reference/types/organization-suggestion'],
  ['organization-resource', '/docs/reference/objects/organization'],
  ['organization-domain-resource', '/docs/reference/types/organization-domain-resource'],
  ['organization-invitation-resource', '/docs/reference/types/organization-invitation'],
  ['organization-membership-request-resource', '/docs/reference/types/organization-membership-request'],
  ['o-auth-application-namespace', '/docs/reference/types/oauth-application'],
  ['o-auth-consent-info', '/docs/reference/types/oauth-consent-info'],
  ['o-auth-consent-scope', '/docs/reference/types/oauth-consent-scope'],
  ['o-auth-strategy', '/docs/reference/types/sso#o-auth-strategy'],
  ['o-auth-provider', '/docs/reference/types/sso#o-auth-provider'],
  ['session', '/docs/reference/backend/types/backend-session'],
  ['session-activity', '/docs/reference/backend/types/backend-session-activity'],
  ['organization', '/docs/reference/backend/types/backend-organization'],
  ['public-organization-data-json', '#public-organization-data-json'],
  ['organization-membership-public-user-data', '#organization-membership-public-user-data'],
  ['identification-link', '/docs/reference/backend/types/backend-identification-link'],
  ['verification', '/docs/reference/backend/types/backend-verification'],
  ['email-address', '/docs/reference/backend/types/backend-email-address'],
  ['enterprise-account', '/docs/reference/backend/types/backend-enterprise-account'],
  ['enterprise-account-connection', '/docs/reference/backend/types/backend-enterprise-account-connection'],
  ['enterprise-connection', '/docs/reference/backend/types/backend-enterprise-connection'],
  ['enterprise-connection-oauth-config', '/docs/reference/backend/types/backend-enterprise-connection-oauth-config'],
  [
    'enterprise-connection-saml-connection',
    '/docs/reference/backend/types/backend-enterprise-connection-saml-connection',
  ],
  ['external-account', '/docs/reference/backend/types/backend-external-account'],
  ['phone-number', '/docs/reference/backend/types/backend-phone-number'],
  ['saml-account', '/docs/reference/backend/types/backend-saml-account'],
  ['web3-wallet', '/docs/reference/backend/types/backend-web3-wallet'],
  ['invitation', '/docs/reference/backend/types/backend-invitation'],
  ['verify-token-options', '#verify-token-options'],
  ['localization-resource', '/docs/guides/customizing-clerk/localization'],
  ['confirm-checkout-params', '/docs/reference/types/billing-checkout-resource#parameters'],
  ['billing-payment-method-resource', '/docs/reference/types/billing-payment-method-resource'],
  ['billing-payer-resource', '/docs/reference/types/billing-payer-resource'],
  ['billing-plan-price', '/docs/reference/types/billing-plan-price'],
  ['billing-plan-resource', '/docs/reference/types/billing-plan-resource'],
  ['billing-plan-unit-price', '/docs/reference/types/billing-plan-unit-price'],
  ['billing-plan-unit-price-tier', '/docs/reference/types/billing-plan-unit-price-tier'],
  ['billing-checkout-totals', '/docs/reference/types/billing-checkout-totals'],
  ['billing-checkout-resource', '/docs/reference/types/billing-checkout-resource'],
  ['billing-money-amount', '/docs/reference/types/billing-money-amount'],
  ['billing-per-unit-total', '/docs/reference/types/billing-per-unit-total'],
  ['billing-per-unit-total-tier', '/docs/reference/types/billing-per-unit-total-tier'],
  ['billing-subscription-item-resource', '/docs/reference/types/billing-subscription-item-resource'],
  ['billing-subscription-item-seats', '/docs/reference/types/billing-subscription-item-seats'],
  ['feature-resource', '/docs/reference/types/feature-resource'],
  ['billing-statement-group', '/docs/reference/types/billing-statement-group'],
  ['billing-statement-resource', '/docs/reference/types/billing-statement-resource'],
  ['billing-subscription-resource', '/docs/reference/types/billing-subscription-resource'],
  ['clerk-api-response-error', '/docs/reference/types/clerk-api-response-error'],
  ['clerk-api-error', '/docs/reference/types/clerk-api-error'],
  ['billing-statement-totals', '/docs/reference/types/billing-statement-totals'],
  ['billing-payment-resource', '/docs/reference/types/billing-payment-resource'],
  ['deleted-object-resource', '/docs/reference/types/deleted-object-resource'],
  ['checkout-flow-resource', '/docs/reference/hooks/use-checkout#checkout-flow-resource'],
  ['organization-creation-defaults-resource', '#organization-creation-defaults-resource'],
  ['billing-namespace', '/docs/reference/objects/billing'],
  ['api-keys-namespace', '/docs/reference/objects/api-keys'],
  ['client-resource', '/docs/reference/objects/client'],
  ['redirect-options', '/docs/reference/types/redirect-options'],
  ['handle-o-auth-callback-params', '/docs/reference/types/handle-o-auth-callback-params'],
  ['session-task', '/docs/reference/types/session-task'],
  ['public-user-data', '/docs/reference/types/public-user-data'],
  ['session-status', '/docs/reference/types/session-status'],
  [
    'create-organization-invitation-params',
    '/docs/reference/backend/organization/create-organization-invitation#create-organization-invitation-params',
  ],
  ['create-organization-domain-params', '#create-organization-domain-params'],
  ['organization-domain-verification', '/docs/reference/types/organization-domain-resource'],
];

/**
 * Inside the generated MDX files are links to other generated MDX files. These relative links need to be replaced with absolute links to pages that exist on clerk.com.
 * For example, `[Clerk](/shared/clerk/clerk.mdx)` needs to be replaced with `[Clerk](/docs/reference/objects/clerk)`.
 * It also shouldn't matter how level deep the relative link is.
 *
 * This function returns an array of `{ pattern: string, replace: string }` to pass into the `typedoc-plugin-replace-text` plugin.
 *
 * @example
 * [foo](../../bar.mdx) -> [foo](/new-path)
 * [foo](./bar.mdx) -> [foo](/new-path)
 * [foo](bar.mdx) -> [foo](/new-path)
 * [foo](bar.mdx#some-id) -> [foo](/new-path#some-id)
 */
function getRelativeLinkReplacements() {
  return LINK_REPLACEMENTS.map(([fileName, newPath]) => {
    return {
      // Match both flat links and nested object-doc links
      // Also matches optional anchors (#)
      pattern: new RegExp(`\\((?:(?:\\.{1,2}\\/)+[^()]*?|)(?:${fileName}\\/)?${fileName}\\.mdx(#[^)]+)?\\)`, 'g'),
      // Preserve the anchor in replacement if it exists
      replace: (/** @type {string} */ _match, anchor = '') => `(${newPath}${anchor})`,
    };
  });
}

/**
 * First pass of `MarkdownPageEvent.END`: rewrite `(foo.mdx)` / relative paths to `/docs/...` (see {@link LINK_REPLACEMENTS}).
 * Used by `extract-methods.mjs`, which does not go through the renderer hook.
 *
 * @param {string} contents
 */
export function applyRelativeLinkReplacements(contents) {
  if (!contents) {
    return contents;
  }
  let out = contents;
  for (const { pattern, replace } of getRelativeLinkReplacements()) {
    // @ts-ignore — string | function
    out = out.replace(pattern, replace);
  }
  return out;
}

/**
 * Bare-identifier → docs-link data table for {@link getCatchAllReplacements}.
 * Each entry is `[name, url]` or `[name, url, linkText]` (defaults to `name`).
 * The regex is derived from `name` via {@link catchAllBareSymbolRegex}.
 * @type {ReadonlyArray<readonly [string, string] | readonly [string, string, string]>}
 */
const CATCH_ALL_TYPE_LINKS = [
  ['APIKeysNamespace', '/docs/reference/objects/api-keys', 'APIKeys'],
  ['ClerkAPIResponseError', '/docs/reference/types/clerk-api-response-error'],
  ['EmailAddressResource', '/docs/reference/types/email-address'],
  ['EnterpriseAccountResource', '/docs/reference/types/enterprise-account'],
  ['ExternalAccountResource', '/docs/reference/types/external-account'],
  ['LastAuthenticationStrategy', '/docs/reference/types/last-authentication-strategy'],
  ['LoadedClerk', '/docs/reference/objects/clerk', 'Clerk'],
  ['LocalizationResource', '/docs/guides/customizing-clerk/localization'],
  ['Machine', '/docs/reference/backend/types/backend-machine'],
  ['OAuthProvider', '/docs/reference/types/sso#o-auth-provider'],
  ['OAuthStrategy', '/docs/reference/types/sso#o-auth-strategy'],
  ['OrganizationInvitationPrivateMetadata', '/docs/reference/types/metadata#organization-invitation-private-metadata'],
  ['OrganizationInvitationPublicMetadata', '/docs/reference/types/metadata#organization-invitation-public-metadata'],
  ['OrganizationMembershipPrivateMetadata', '/docs/reference/types/metadata#organization-membership-private-metadata'],
  ['OrganizationMembershipPublicMetadata', '/docs/reference/types/metadata#organization-membership-public-metadata'],
  ['OrganizationPrivateMetadata', '/docs/reference/types/metadata#organization-private-metadata'],
  ['OrganizationPublicMetadata', '/docs/reference/types/metadata#organization-public-metadata'],
  ['OrganizationResource', '/docs/reference/objects/organization'],
  ['PasskeyResource', '/docs/reference/types/passkey-resource'],
  ['PhoneNumberResource', '/docs/reference/types/phone-number'],
  ['SessionStatusClaim', '/docs/reference/types/session-status'],
  ['SetActiveParams', '/docs/reference/types/set-active-params'],
  ['SignedInSessionResource', '/docs/reference/objects/session'],
  ['SignInErrors', '/docs/reference/types/errors'],
  ['SignInFirstFactor', '/docs/reference/types/sign-in-first-factor'],
  ['SignInFutureResource', '/docs/reference/objects/sign-in-future'],
  ['SignInRedirectOptions', '/docs/reference/types/sign-in-redirect-options'],
  ['SignInResource', '/docs/reference/objects/sign-in'],
  ['SignInSecondFactor', '/docs/reference/types/sign-in-second-factor'],
  ['SignUpErrors', '/docs/reference/types/errors'],
  ['SignUpFutureResource', '/docs/reference/objects/sign-up-future'],
  ['SignUpRedirectOptions', '/docs/reference/types/sign-up-redirect-options'],
  ['SignUpResource', '/docs/reference/objects/sign-up'],
  ['SignUpUnsafeMetadata', '/docs/reference/types/metadata#sign-up-unsafe-metadata'],
  ['SignUpVerificationResource', '/docs/reference/types/sign-up-verification-resource'],
  ['TasksRedirectOptions', '/docs/reference/types/redirect-options'],
  ['UserPrivateMetadata', '/docs/reference/types/metadata#user-private-metadata'],
  ['UserPublicMetadata', '/docs/reference/types/metadata#user-public-metadata'],
  ['UserResource', '/docs/reference/objects/user'],
  ['UserUnsafeMetadata', '/docs/reference/types/metadata#user-unsafe-metadata'],
  ['VerificationResource', '/docs/reference/types/verification-resource'],
  ['Web3WalletResource', '/docs/reference/types/web3-wallet'],
];

/**
 * Match a bare identifier not already inside a link (`[…]`), inline code (`` `…` ``), heading anchor (`#…`), or word-character run. Optional wrapping backticks on the match are consumed so the replacement produces a clean `[Name](url)` link.
 * @param {string} name
 */
function catchAllBareSymbolRegex(name) {
  return new RegExp(`(?<![\\[\\w\`#])\`?${name}\`?(?![\\]\\w\`])`, 'g');
}

function getCatchAllReplacements() {
  /** @type {{ pattern: RegExp; replace: string | ((...args: any[]) => string) }[]} */
  const linkRules = CATCH_ALL_TYPE_LINKS.map(([name, url, linkText]) => ({
    pattern: catchAllBareSymbolRegex(name),
    replace: `[${linkText ?? name}](${url})`,
  }));
  return [
    ...linkRules,
    {
      // `SessionResource[]` array suffix needs preserving; boundary is `\b` (not the shared
      // negative-lookbehind used elsewhere) so bare `SessionResource` in prose still matches.
      pattern: /(?<![`#[\]])\bSessionResource(\[\])?\b(?![\]\)`])/g,
      replace: '[SessionResource](/docs/reference/objects/session)$1',
    },
    {
      pattern: /(?<![\[\w`#])`Appearance`\\<`Theme`\\>/g,
      replace: '[Appearance<Theme>](/docs/guides/customizing-clerk/appearance-prop/overview)',
    },
    {
      // In-page anchor for `CreateOrganizationParams` — only inside parentheses (prose lists).
      pattern: /(?<![#])\(CreateOrganizationParams\)/g,
      replace: '([CreateOrganizationParams](#create-organization-params))',
    },
    // typedoc-plugin-markdown emits `@deprecated` as `**Deprecated**`; add a full stop.
    { pattern: /\*\*Deprecated\*\*/g, replace: '**Deprecated.**' },
    // `@default` renders as `**Default** \`value\``; rewrite to `Defaults to \`value\`.`.
    { pattern: /\*\*Default\*\* `([^`]+)`/g, replace: 'Defaults to `$1`.' },
    // Single `@example` renders as `**Example** \`value\``; rewrite to `Example: \`value\`.`.
    { pattern: /\*\*Example\*\* `([^`]+)`/g, replace: 'Example: `$1`.' },
    // Multiple `@example` render as `**Examples** \`v1\` \`v2\``; rewrite to a comma-joined list.
    {
      pattern: /\*\*Examples\*\* ((?:`[^`]+`)(?: `[^`]+`)*)/g,
      replace: (/** @type {string} */ _match, /** @type {string} */ capturedGroup) =>
        `Examples: ${capturedGroup.split(' ').join(', ')}.`,
    },
  ];
}

/** CommonMark ATX heading: optional indent, 1–6 `#`, then space or end — entire line is left unchanged. */
const ATX_HEADING_LINE = /^\s{0,3}#{1,6}(?:\s|$)/;

/** Private-use placeholders — must not appear in real MDX and must not match catch-all patterns. */
const PIPE_CODE_PH = /\uE000(\d+)\uE001/g;

/**
 * Inline code that contains a pipe (e.g. `` `a \\| b` `` or `` `a | b` ``) cannot receive link replacements without breaking MDX. Replace those whole spans with placeholders, run catch-alls, then restore.
 *
 * @param {string} line
 * @returns {{ text: string, placeholders: string[] }}
 */
function protectPipeDelimitedInlineCodeSpans(line) {
  /** @type {string[]} */
  const placeholders = [];
  const text = line.replace(/`([^`\n]*)`/g, (full, inner) => {
    if (!inner.includes('|')) {
      return full;
    }
    const id = placeholders.length;
    placeholders.push(full);
    return `\uE000${id}\uE001`;
  });
  return { text, placeholders };
}

/**
 * @param {string} text
 * @param {string[]} placeholders
 */
function restoreProtectedInlineCodeSpans(text, placeholders) {
  return text.replace(PIPE_CODE_PH, (_, /** @type {string} */ i) => placeholders[Number(i)] ?? '');
}

/**
 * Second pass of `MarkdownPageEvent.END` (after {@link applyRelativeLinkReplacements}).
 * Used by `extract-methods.mjs`, which writes MDX outside TypeDoc and never hits that hook.
 *
 * Skips ATX heading lines (`#` … `######`) so titles like `#### SetActiveParams` are never linkified.
 * (A lone `(?<!#)` in regex is not enough: heading text is separated from `###` by spaces.)
 *
 * Skips inline code spans that contain `|` (union / enum style like `` `v1 \\| v2` ``) so link rules do
 * not run inside them — otherwise MDX breaks.
 *
 * @param {string} contents
 */
export function applyCatchAllMdReplacements(contents) {
  if (!contents) {
    return contents;
  }
  return contents
    .split('\n')
    .map(
      /** @param {string} line */ line => {
        if (ATX_HEADING_LINE.test(line.replace(/\r$/, ''))) {
          return line;
        }
        const { text: withPh, placeholders } = protectPipeDelimitedInlineCodeSpans(line);
        let out = withPh;
        for (const { pattern, replace } of getCatchAllReplacements()) {
          // @ts-ignore — string | function
          out = out.replace(pattern, replace);
        }
        return restoreProtectedInlineCodeSpans(out, placeholders);
      },
    )
    .join('\n');
}

/**
 * Walk a typedoc Type and return a flat list of property declarations to render as a merged table. Used by the `@expandProperties` flattener below to handle three shapes:
 *   - intersection types: walk each constituent
 *   - inline object literals (ReflectionType): take its declaration.children
 *   - named references (ReferenceType): take the target's children plus any properties contributed via type arguments, which captures the `Foo<{ ... }>` instantiation pattern where typedoc otherwise loses the generic parameter at the alias boundary.
 *
 * @param {import('typedoc').SomeType | undefined} type
 * @param {Map<string, import('typedoc').Reflection>} reflectionsByName lookup for cross-package refs whose `.reflection` is not linked
 * @returns {import('typedoc').DeclarationReflection[]}
 */
function collectPropertiesFromType(type, reflectionsByName) {
  if (!type) return [];
  if (type.type === 'reflection') {
    return type.declaration?.children ?? [];
  }
  if (type.type === 'intersection') {
    return type.types.flatMap(t => collectPropertiesFromType(t, reflectionsByName));
  }
  if (type.type === 'reference') {
    const target = type.reflection ?? reflectionsByName.get(type.name);
    const targetChildren = target?.children ?? [];
    const argChildren = (type.typeArguments ?? []).flatMap(t => collectPropertiesFromType(t, reflectionsByName));
    return [...targetChildren, ...argChildren];
  }
  return [];
}

/**
 * Structural fingerprint for a `Type`. Recurses into composite shapes so two types that only differ in their type arguments (`Foo<string>` vs `Foo<number>`) or in their nested property types (`{ x: string }` vs `{ x: number }`) get distinct fingerprints. Two shapes that produce the same fingerprint are treated as structurally identical and so eligible for cross-pollinating JSDoc comments.
 *
 * Recursion guard: a single shared `Set` of visited reflection ids threads through every nested call to avoid infinite loops on cyclic types (e.g. a type literal that ultimately references itself).
 *
 * @param {import('typedoc').SomeType | undefined} type
 * @param {Set<number>} [seen]
 * @returns {string}
 */
function typeFingerprint(type, seen = new Set()) {
  if (!type) return '?';
  const t =
    /** @type {{ type?: string; name?: string; value?: unknown; elementType?: import('typedoc').SomeType; types?: import('typedoc').SomeType[]; typeArguments?: import('typedoc').SomeType[]; declaration?: import('typedoc').DeclarationReflection }} */ (
      /** @type {unknown} */ (type)
    );
  switch (t.type) {
    case 'intrinsic':
      return `i:${t.name ?? ''}`;
    case 'literal':
      return `l:${JSON.stringify(t.value)}`;
    case 'reference': {
      const args = t.typeArguments?.length ? `<${t.typeArguments.map(a => typeFingerprint(a, seen)).join(',')}>` : '';
      return `r:${t.name ?? ''}${args}`;
    }
    case 'array':
      return `a:${typeFingerprint(t.elementType, seen)}`;
    case 'optional':
      return `o:${typeFingerprint(t.elementType, seen)}`;
    case 'union':
      return `u:[${(t.types ?? [])
        .map(a => typeFingerprint(a, seen))
        .sort()
        .join(',')}]`;
    case 'intersection':
      return `n:[${(t.types ?? [])
        .map(a => typeFingerprint(a, seen))
        .sort()
        .join(',')}]`;
    case 'reflection': {
      const decl = t.declaration;
      if (decl?.id != null) {
        if (seen.has(decl.id)) return `rf:<cycle>`;
        seen.add(decl.id);
      }
      const kids = decl?.children?.filter(c => c.kindOf?.(ReflectionKind.Property)) ?? [];
      return `rf:[${kids
        .map(c => `${c.name}${c.flags?.isOptional ? '?' : ''}:${typeFingerprint(c.type, seen)}`)
        .sort()
        .join(',')}]`;
    }
    default:
      return t.type ?? '?';
  }
}

/**
 * When TypeScript resolves a type through `Omit<...>` / `Pick<...>` (e.g. `ClerkProviderProps = Omit<IsomorphicClerkOptions, …> & { … }`), inline anonymous object literal property types get re-synthesized — and TypeDoc loses the JSDoc on most of their members. Only the first/leading property's comment survives, the rest come through with `comment === undefined`. The same shape elsewhere in the project (e.g. directly under `IsomorphicClerkOptions['telemetry']`) carries all comments correctly.
 *
 * Match `@kind:typeLiteral` reflections by structural fingerprint (set of `(name, type, optional)` tuples on their property children); within each group, pick the reflection with the most commented children as the source-of-truth and copy missing comments onto its siblings.
 *
 * @param {import('typedoc').Reflection[]} all
 */
function backfillInlineObjectChildComments(all) {
  /** @type {Map<string, import('typedoc').DeclarationReflection[]>} */
  const groups = new Map();
  for (const r of all) {
    if (!r.kindOf?.(ReflectionKind.TypeLiteral)) continue;
    const decl = /** @type {import('typedoc').DeclarationReflection} */ (r);
    const propChildren = decl.children?.filter(c => c.kindOf?.(ReflectionKind.Property));
    if (!propChildren?.length) continue;
    const key = propChildren
      .map(c => `${c.name}${c.flags?.isOptional ? '?' : ''}:${typeFingerprint(c.type)}`)
      .sort()
      .join('|');
    if (!groups.has(key)) groups.set(key, []);
    /** @type {import('typedoc').DeclarationReflection[]} */ (groups.get(key)).push(decl);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    /** @type {import('typedoc').DeclarationReflection | null} */
    let best = null;
    let bestScore = -1;
    for (const refl of group) {
      const score =
        refl.children?.filter(c => c.kindOf?.(ReflectionKind.Property) && c.comment?.summary?.length).length ?? 0;
      if (score > bestScore) {
        best = refl;
        bestScore = score;
      }
    }
    if (!best || bestScore === 0) continue;
    /** @type {Map<string, import('typedoc').DeclarationReflection>} */
    const bestByName = new Map();
    for (const c of best.children ?? []) {
      if (c.kindOf?.(ReflectionKind.Property)) bestByName.set(c.name, c);
    }
    for (const refl of group) {
      if (refl === best) continue;
      for (const child of refl.children ?? []) {
        if (!child.kindOf?.(ReflectionKind.Property)) continue;
        // Any `.comment` object means TypeDoc found a JSDoc block at the source — including
        // intentionally empty comments left over from `@generateWithEmptyComment` after the
        // modifier tag is stripped in `EVENT_RESOLVE_END`. Only fill in children that have
        // no comment at all.
        if (child.comment) continue;
        const src = bestByName.get(child.name);
        if (src?.comment?.summary?.length) child.comment = src.comment;
      }
    }
  }
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  /**
   * `@generateWithEmptyComment` exists only to make "intentionally undocumented" explicit at the source.
   * Strip it from the model post-resolve so the markdown plugin sees a comment indistinguishable from `/** *​/` —
   * otherwise the table renderer treats the modifier as content and drops the `-` placeholder in the description column.
   */
  app.converter.on(Converter.EVENT_RESOLVE_END, context => {
    for (const reflection of Object.values(context.project.reflections)) {
      reflection.comment?.modifierTags?.delete('@generateWithEmptyComment');
    }
  });

  /**
   * Flatten the `Foo<{...}>` generic-instantiation pattern into a single merged properties table when `Foo` opts in via `@expandProperties`. typedoc-plugin-markdown would otherwise render an empty page for these aliases because the resolved type is a `ReferenceType` with no inline declaration — see `member.declaration.js` in the plugin, which only walks `IntersectionType` sub-types and has no branch for top-level `ReferenceType`.
   *
   * Runs at `RendererEvent.BEGIN` rather than `EVENT_RESOLVE_END` because the resolve hook fires per package, and cross-package references (e.g. `@clerk/backend` types referencing `ClerkPaginationRequest` from `@clerk/shared`) only link up after typedoc merges packages.
   *
   * The opt-in tag lives on the wrapper type so we never accidentally flatten unrelated generic aliases (e.g. `SignInErrors = Errors<SignInFields>`).
   */
  app.renderer.on(RendererEvent.BEGIN, event => {
    const all = Object.values(event.project.reflections);
    const reflectionsByName = new Map();
    for (const r of all) {
      if (r.name && !reflectionsByName.has(r.name)) reflectionsByName.set(r.name, r);
    }
    const expandable = new Set();
    for (const r of all) {
      if (r.comment?.modifierTags?.has('@expandProperties')) {
        expandable.add(r);
        r.comment.modifierTags.delete('@expandProperties');
      }
    }
    for (const reflection of all) {
      if (
        reflection.kindOf?.(ReflectionKind.TypeAlias) &&
        reflection.type?.type === 'reference' &&
        Array.isArray(reflection.type.typeArguments) &&
        reflection.type.typeArguments.length > 0
      ) {
        const target = reflection.type.reflection ?? reflectionsByName.get(reflection.type.name);
        if (!target || !expandable.has(target)) continue;
        const merged = collectPropertiesFromType(reflection.type, reflectionsByName);
        if (merged.length > 0) {
          // typedoc's package-level `sort: 'alphabetical'` is applied during conversion, before
          // our synthetic merge runs. Sort here to match the alphabetical ordering used by
          // every other table in the docs.
          merged.sort((a, b) => a.name.localeCompare(b.name));
          const decl = new DeclarationReflection('__type', ReflectionKind.TypeLiteral, reflection);
          decl.children = merged;
          reflection.type = new ReflectionType(decl);
        }
      }
    }

    backfillInlineObjectChildComments(all);
  });

  app.renderer.on(MarkdownPageEvent.END, output => {
    if (output.contents) {
      output.contents = applyRelativeLinkReplacements(output.contents);
      output.contents = applyCatchAllMdReplacements(output.contents);
    }
  });
}
