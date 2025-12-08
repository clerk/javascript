import type { FeatureJSON } from './JSON';

/**
 * The `Feature` object represents a Feature of a Subscription Plan.
 *
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class Feature {
  constructor(
    /**
     * The unique identifier for the Feature.
     */
    readonly id: string,
    /**
     * The name of the Feature.
     */
    readonly name: string,
    /**
     * The description of the Feature.
     */
    readonly description: string | null,
    /**
     * The URL-friendly identifier of the Feature.
     */
    readonly slug: string,
    /**
     * The URL of the Feature's avatar image.
     */
    readonly avatarUrl: string | null,
  ) {}

  static fromJSON(data: FeatureJSON): Feature {
    return new Feature(data.id, data.name, data.description ?? null, data.slug, data.avatar_url ?? null);
  }
}
