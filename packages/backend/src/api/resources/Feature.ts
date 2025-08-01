import type { FeatureJSON } from './JSON';

export class Feature {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly slug: string,
    readonly avatarUrl: string,
  ) {}

  static fromJSON(data: FeatureJSON): Feature {
    return new Feature(data.id, data.name, data.description, data.slug, data.avatar_url);
  }
}
