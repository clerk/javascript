import { describe, expect, it } from 'vitest';

// @ts-expect-error — .mjs plugin has no type declarations
import { applyRelativeLinkReplacements } from '../custom-plugin.mjs';

/**
 * Unit coverage for the `LINK_REPLACEMENTS` rules exercised through the exported
 * `applyRelativeLinkReplacements()` entry point. These guard the Billing checkout
 * links so an incorrect route or anchor cannot silently pass CI.
 */
describe('applyRelativeLinkReplacements', () => {
  const cases: Array<[label: string, input: string, expected: string]> = [
    [
      'confirm-checkout-params routes to the #confirm-parameters section',
      '[x](confirm-checkout-params.mdx)',
      '[x](/docs/reference/types/billing-checkout-resource#confirm-parameters)',
    ],
    [
      'update-checkout-params routes to the #update-parameters section',
      '[x](update-checkout-params.mdx)',
      '[x](/docs/reference/types/billing-checkout-resource#update-parameters)',
    ],
    [
      'preserves an anchor from the source link',
      '[x](billing-credits.mdx#total)',
      '[x](/docs/reference/types/billing-credits#total)',
    ],
    [
      'billing-credits routes to its standalone page',
      '[x](billing-credits.mdx)',
      '[x](/docs/reference/types/billing-credits)',
    ],
    [
      'billing-applied-discount routes to its standalone page',
      '[x](billing-applied-discount.mdx)',
      '[x](/docs/reference/types/billing-applied-discount)',
    ],
    [
      'billing-discount-redemption routes to its standalone page',
      '[x](billing-discount-redemption.mdx)',
      '[x](/docs/reference/types/billing-discount-redemption)',
    ],
    [
      'billing-payer-credit routes to its standalone page',
      '[x](billing-payer-credit.mdx)',
      '[x](/docs/reference/types/billing-payer-credit)',
    ],
    [
      'billing-proration-credit-detail routes to its standalone page',
      '[x](billing-proration-credit-detail.mdx)',
      '[x](/docs/reference/types/billing-proration-credit-detail)',
    ],
    [
      'resolves relative path prefixes',
      '[x](../../types/billing-credits.mdx)',
      '[x](/docs/reference/types/billing-credits)',
    ],
    [
      'resolves nested object-doc links',
      '[x](billing-credits/billing-credits.mdx)',
      '[x](/docs/reference/types/billing-credits)',
    ],
  ];

  it.each(cases)('%s', (_label, input, expected) => {
    expect(applyRelativeLinkReplacements(input)).toBe(expected);
  });

  it('routes the two sibling next-payment pages independently', () => {
    expect(applyRelativeLinkReplacements('[x](billing-subscription-item-next-payment.mdx)')).toBe(
      '[x](/docs/reference/types/billing-subscription-item-next-payment)',
    );
    expect(applyRelativeLinkReplacements('[x](billing-subscription-next-payment.mdx)')).toBe(
      '[x](/docs/reference/types/billing-subscription-next-payment)',
    );
  });

  it('does not rewrite a page whose name is a prefix of a replacement key', () => {
    // `billing-payer` is a prefix of `billing-payer-credit`, but the `.mdx` boundary
    // must keep an unrelated `billing-payer-resource.mdx` link from being mis-routed.
    expect(applyRelativeLinkReplacements('[x](billing-payer-resource.mdx)')).toBe(
      '[x](/docs/reference/types/billing-payer-resource)',
    );
  });

  it('leaves content without matching links untouched', () => {
    expect(applyRelativeLinkReplacements('no links here')).toBe('no links here');
    expect(applyRelativeLinkReplacements('')).toBe('');
  });
});
