import type { FlattenedLocalizationResource, LocalizationResource } from '@clerk/shared/types';
import { unflattenObject, validateLocalizationFormat } from '@clerk/shared/utils';

/**
 * Converts a flattened localization object (with dot-notation keys) to a nested LocalizationResource.
 *
 * This utility function validates the input format and converts flattened keys like
 * `"unstable__errors.passwordComplexity.maximumLength"` into nested objects that can be used
 * with the `localization` prop in Clerk components.
 *
 * @example
 * ```typescript
 * const flattened = {
 *   "locale": "en-US",
 *   "formFieldLabel__emailAddress": "Email address",
 *   "unstable__errors.passwordComplexity.maximumLength": "Password is too long"
 * };
 *
 * const nested = flatLocalization(flattened);
 * // Result:
 * // {
 * //   locale: "en-US",
 * //   formFieldLabel__emailAddress: "Email address",
 * //   unstable__errors: {
 * //     passwordComplexity: {
 * //       maximumLength: "Password is too long"
 * //     }
 * //   }
 * // }
 * ```
 *
 * @param input - A flattened localization object with dot-notation keys
 * @returns A nested LocalizationResource that can be used with the `localization` prop
 * @throws {Error} If the input format is invalid or mixes flattened and nested formats
 */
export function flatLocalization(input: FlattenedLocalizationResource): LocalizationResource {
  // Validate first before any early returns
  validateLocalizationFormat(input as Record<string, unknown>);

  if (!input || Object.keys(input).length === 0) {
    return {} as LocalizationResource;
  }

  return unflattenObject<LocalizationResource>(input as Record<string, unknown>);
}
