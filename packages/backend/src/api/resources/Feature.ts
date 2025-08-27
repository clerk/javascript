import type { FeatureJSON } from './JSON';

/**
 * A feature of a subscription plan.
 */
export class Feature {
  constructor(
    /**
     * The unique identifier for the feature.
     */
    readonly id: string,
    /**
     * The name of the feature.
     */
    readonly name: string,
    /**
     * The description of the feature.
     */
    readonly description: string,
    /**
     * The URL-friendly identifier of the feature.
     */
    readonly slug: string,
    /**
     * The URL of the feature's avatar image.
     */
    readonly avatarUrl: string,
  ) {}

  static fromJSON(data: FeatureJSON): Feature {
    return new Feature(data.id, data.name, data.description, data.slug, data.avatar_url);
  }
}
