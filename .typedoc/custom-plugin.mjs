// @ts-check - Enable TypeScript checks for safer MDX post-processing and link rewriting
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * A list of files where we want to remove any headings
 * TODO: Move this logic to the custom-theme logic and don't change it after the fact
 */
const FILES_WITHOUT_HEADINGS = [
  'use-organization-return.mdx',
  'use-organization-params.mdx',
  'paginated-resources.mdx',
  'pages-or-infinite-options.mdx',
  'paginated-hook-config.mdx',
  'use-organization-list-return.mdx',
  'use-organization-list-params.mdx',
  'create-organization-params.mdx',
  'authenticate-request-options.mdx',
  'verify-token-options.mdx',
  'public-organization-data-json.mdx',
  'organization-membership-public-user-data.mdx',
  'checkout-signal-value.mdx',
  'checkout-flow-resource.mdx',
  'use-checkout-options.mdx',
  'use-payment-element-return.mdx',
  'use-payment-methods-return.mdx',
  'use-payment-attempts-return.mdx',
  'use-plans-return.mdx',
  'use-statements-return.mdx',
  'hook-params.mdx',
  'use-subscription-params.mdx',
  'subscription-result.mdx',
  'needs-reverification-parameters.mdx',
  'use-reverification-options.mdx',
  'use-reverification-params.mdx',
  'payment-element-provider-props.mdx',
  'payment-element-props.mdx',
  'use-organization-creation-defaults-return.mdx',
  'use-organization-creation-defaults-params.mdx',
];

/**
 * An array of tuples where the first element is the file name and the second element is the new path.
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
  ['organization-membership-resource', '/docs/reference/types/organization-membership'],
  ['organization-suggestion-resource', '/docs/reference/types/organization-suggestion'],
  ['organization-resource', '/docs/reference/objects/organization'],
  ['organization-domain-resource', '/docs/reference/types/organization-domain-resource'],
  ['organization-invitation-resource', '/docs/reference/types/organization-invitation'],
  ['organization-membership-request-resource', '/docs/reference/types/organization-membership-request'],
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
  ['billing-statement-totals', '/docs/reference/types/billing-statement-totals'],
  ['billing-payment-resource', '/docs/reference/types/billing-payment-resource'],
  ['deleted-object-resource', '/docs/reference/types/deleted-object-resource'],
  ['checkout-flow-resource', '/docs/reference/hooks/use-checkout#checkout-flow-resource'],
  ['organization-creation-defaults-resource', '#organization-creation-defaults-resource'],
];

/**
 * Inside the generated MDX files are links to other generated MDX files. These relative links need to be replaced with absolute links to pages that exist on clerk.com.
 * For example, `[Foobar](../../foo/bar.mdx)` needs to be replaced with `[Foobar](/docs/foo/bar)`.
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
      // Match both path and optional anchor
      pattern: new RegExp(`\\((?:(?:\\.{1,2}\\/)+[^()]*?|)${fileName}\\.mdx(#[^)]+)?\\)`, 'g'),
      // Preserve the anchor in replacement if it exists
      replace: (/** @type {string} */ _match, anchor = '') => `(${newPath}${anchor})`,
    };
  });
}

function getCatchAllReplacements() {
  return [
    {
      pattern: /(?<![\[\w`])`Appearance`\\<`Theme`\\>/g,
      replace: '[`Appearance<Theme>`](/docs/guides/customizing-clerk/appearance-prop/overview)',
    },
    {
      pattern: /\(CreateOrganizationParams\)/g,
      replace: '([CreateOrganizationParams](#create-organization-params))',
    },
    {
      pattern: /`LoadedClerk`/g,
      replace: '[Clerk](/docs/reference/objects/clerk)',
    },
    {
      pattern: /(?<![\[\w`])`?LocalizationResource`?(?![\]\w`])/g,
      replace: '[`LocalizationResource`](/docs/guides/customizing-clerk/localization)',
    },
    {
      // SessionResource appears in plain text, with an array next to it, with backticks, etc.
      // e.g. `SessionResource[]`
      pattern: /(?<![`[\]])\bSessionResource(\[\])?\b(?![\]\)`])/g,
      replace: '[`SessionResource`](/docs/reference/objects/session)$1',
    },
    {
      pattern: /(?<![\[\w`])`?SessionStatusClaim`?(?![\]\w`])/g,
      replace: '[`SessionStatusClaim`](/docs/reference/types/session-status)',
    },
    {
      pattern: /(?<![`[\]])\bSetActiveParams\b(?![\]\(])/g,
      replace: '[SetActiveParams](/docs/reference/types/set-active-params)',
    },
    {
      pattern: /(?<![\[\w`])`?SignInResource`?(?![\]\w`])/g,
      replace: '[`SignInResource`](/docs/reference/objects/sign-in)',
    },
    {
      pattern: /(?<![\[\w`])`?((?:SignIn|SignUp)Errors)`?(?![\]\w`])/g,
      replace: (/** @type {string} */ _match, /** @type {string} */ type) =>
        `[\`${type}\`](/docs/reference/types/errors)`,
    },
    {
      pattern: /(?<![\[\w`])`?SignInFutureResource`?(?![\]\w`])/g,
      replace: '[`SignInFutureResource`](/docs/reference/objects/sign-in-future)',
    },
    {
      pattern: /(?<![\[\w`])`?SignedInSessionResource`?(?![\]\w`])/g,
      replace: '[`SignedInSessionResource`](/docs/reference/objects/session)',
    },
    {
      pattern: /(?<![\[\w`])`?SignUpResource`?(?![\]\w`])/g,
      replace: '[`SignUpResource`](/docs/reference/objects/sign-up)',
    },
    {
      pattern: /(?<![\[\w`])`?SignUpFutureResource`?(?![\]\w`])/g,
      replace: '[`SignUpFutureResource`](/docs/reference/objects/sign-up-future)',
    },
    {
      pattern: /(?<![\[\w`])`?OrganizationResource`?(?![\]\w`])/g,
      replace: '[`OrganizationResource`](/docs/reference/objects/organization)',
    },
    {
      pattern: /`OrganizationPrivateMetadata`/g,
      replace: '[`OrganizationPrivateMetadata`](/docs/reference/types/metadata#organization-private-metadata)',
    },
    {
      pattern: /OrganizationPublicMetadata/g,
      replace: '[OrganizationPublicMetadata](/docs/reference/types/metadata#organization-public-metadata)',
    },
    {
      pattern: /`OrganizationInvitationPrivateMetadata`/g,
      replace:
        '[`OrganizationInvitationPrivateMetadata`](/docs/reference/types/metadata#organization-invitation-private-metadata)',
    },
    {
      pattern: /`OrganizationInvitationPublicMetadata`/g,
      replace:
        '[`OrganizationInvitationPublicMetadata`](/docs/reference/types/metadata#organization-invitation-public-metadata)',
    },
    {
      pattern: /`OrganizationMembershipPrivateMetadata`/g,
      replace:
        '[`OrganizationMembershipPrivateMetadata`](/docs/reference/types/metadata#organization-membership-private-metadata)',
    },
    {
      pattern: /`OrganizationMembershipPublicMetadata`/g,
      replace:
        '[`OrganizationMembershipPublicMetadata`](/docs/reference/types/metadata#organization-membership-public-metadata)',
    },
    {
      pattern: /(?<![\[\w`])`?UserResource`?(?![\]\w`])/g,
      replace: '[`UserResource`](/docs/reference/objects/user)',
    },
    {
      /**
       * By default, `@deprecated` is output with `**Deprecated**`. We want to add a full stop to it.
       */
      pattern: /\*\*Deprecated\*\*/g,
      replace: '**Deprecated.**',
    },
    {
      /**
       * By default, `@default` is output with "**Default** `value`". We want to capture the value and place it inside "Defaults to `value`."
       */
      pattern: /\*\*Default\*\* `([^`]+)`/g,
      replace: 'Defaults to `$1`.',
    },
    {
      /**
       * By default, `@example` is output with "**Example** `value`". We want to capture the value and place it inside "Example: `value`."
       */
      pattern: /\*\*Example\*\* `([^`]+)`/g,
      replace: 'Example: `$1`.',
    },
    {
      /**
       * By default, multiple `@example` are output with "**Examples** `value1` `value2`". We want to capture the values and place them inside "Examples: `value1`, `value2`."
       */
      pattern: /\*\*Examples\*\* ((?:`[^`]+`)(?: `[^`]+`)*)/g,
      replace: (/** @type {string} */ _match, /** @type {string} */ capturedGroup) => {
        return `Examples: ${capturedGroup.split(' ').join(', ')}.`;
      },
    },
  ];
}

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, output => {
    const fileName = output.url.split('/').pop();
    const linkReplacements = getRelativeLinkReplacements();

    for (const { pattern, replace } of linkReplacements) {
      if (output.contents) {
        output.contents = output.contents.replace(pattern, replace);
      }
    }

    const catchAllReplacements = getCatchAllReplacements();

    for (const { pattern, replace } of catchAllReplacements) {
      if (output.contents) {
        // @ts-ignore - Mixture of string and function replacements
        output.contents = output.contents.replace(pattern, replace);
      }
    }

    if (fileName) {
      if (FILES_WITHOUT_HEADINGS.includes(fileName)) {
        if (output.contents) {
          // Remove any headings from the file, irrespective of the level
          output.contents = output.contents.replace(/^#+\s.+/gm, '');
        }
      }
    }
  });
}
