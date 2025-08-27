// @ts-check
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
  'pages-or-infinite-options.mdx',
  'paginated-hook-config.mdx',
  'use-organization-list-return.mdx',
  'use-organization-list-params.mdx',
  'create-organization-params.mdx',
  'authenticate-request-options.mdx',
  'verify-token-options.mdx',
  'public-organization-data-json.mdx',
  'organization-membership-public-user-data.mdx',
];

/**
 * An array of tuples where the first element is the file name and the second element is the new path.
 * Ideally this is a temporary solution until every one of these files are published in production and can be linked to.
 */
const LINK_REPLACEMENTS = [
  ['clerk-paginated-response', '/docs/references/javascript/types/clerk-paginated-response'],
  ['paginated-resources', '#paginated-resources'],
  ['session-resource', '/docs/references/javascript/session'],
  ['signed-in-session-resource', '/docs/references/javascript/session'],
  ['sign-up-resource', '/docs/references/javascript/sign-up'],
  ['user-resource', '/docs/references/javascript/user'],
  ['session-status-claim', '/docs/references/javascript/types/session-status'],
  ['user-organization-invitation-resource', '/docs/references/javascript/types/user-organization-invitation'],
  ['organization-membership-resource', '/docs/references/javascript/types/organization-membership'],
  ['organization-suggestion-resource', '/docs/references/javascript/types/organization-suggestion'],
  ['organization-resource', '/docs/references/javascript/organization'],
  ['organization-domain-resource', '/docs/references/javascript/types/organization-domain'],
  ['organization-invitation-resource', '/docs/references/javascript/types/organization-invitation'],
  ['organization-membership-request-resource', '/docs/references/javascript/types/organization-membership-request'],
  ['session', '/docs/references/backend/types/backend-session'],
  ['session-activity', '/docs/references/backend/types/backend-session-activity'],
  ['organization', '/docs/references/backend/types/backend-organization'],
  ['public-organization-data-json', '#public-organization-data-json'],
  ['organization-membership-public-user-data', '#organization-membership-public-user-data'],
  ['identification-link', '/docs/references/backend/types/backend-identification-link'],
  ['verification', '/docs/references/backend/types/backend-verification'],
  ['email-address', '/docs/references/backend/types/backend-email-address'],
  ['external-account', '/docs/references/backend/types/backend-external-account'],
  ['phone-number', '/docs/references/backend/types/backend-phone-number'],
  ['saml-account', '/docs/references/backend/types/backend-saml-account'],
  ['web3-wallet', '/docs/references/backend/types/backend-web3-wallet'],
  ['verify-token-options', '#verify-token-options'],
  ['localization-resource', '/docs/customization/localization'],
  ['commerce-subscription-item-resource', '/docs/references/javascript/types/commerce-subscription-item-resource'],
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
      pattern: /\(setActiveParams\)/g,
      replace: '([setActiveParams](/docs/references/javascript/types/set-active-params))',
    },
    {
      pattern: /`LoadedClerk`/g,
      replace: '[Clerk](/docs/references/javascript/clerk)',
    },
    {
      pattern: /\(CreateOrganizationParams\)/g,
      replace: '([CreateOrganizationParams](#create-organization-params))',
    },
    {
      pattern: /\| `SignInResource` \|/,
      replace: '| [SignInResource](/docs/references/javascript/sign-in) |',
    },
    {
      pattern: /`OrganizationPrivateMetadata`/g,
      replace:
        '[`OrganizationPrivateMetadata`](/docs/references/javascript/types/metadata#organization-private-metadata)',
    },
    {
      pattern: /OrganizationPublicMetadata/g,
      replace: '[OrganizationPublicMetadata](/docs/references/javascript/types/metadata#organization-public-metadata)',
    },
    {
      pattern: /`OrganizationInvitationPrivateMetadata`/g,
      replace:
        '[`OrganizationInvitationPrivateMetadata`](/docs/references/javascript/types/metadata#organization-invitation-private-metadata)',
    },
    {
      pattern: /`OrganizationInvitationPublicMetadata`/g,
      replace:
        '[`OrganizationInvitationPublicMetadata`](/docs/references/javascript/types/metadata#organization-invitation-public-metadata)',
    },
    {
      pattern: /`OrganizationMembershipPrivateMetadata`/g,
      replace:
        '[`OrganizationMembershipPrivateMetadata`](/docs/references/javascript/types/metadata#organization-membership-private-metadata)',
    },
    {
      pattern: /`OrganizationMembershipPublicMetadata`/g,
      replace:
        '[`OrganizationMembershipPublicMetadata`](/docs/references/javascript/types/metadata#organization-membership-public-metadata)',
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
