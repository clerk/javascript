import type { JwtTemplateJSON } from './JSON';

export class JwtTemplate {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly claims: object,
    readonly lifetime: number,
    readonly allowedClockSkew: number,
    readonly customSigningKey: boolean,
    readonly signingAlgorithm: string,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: JwtTemplateJSON): JwtTemplate {
    return new JwtTemplate(
      data.id,
      data.name,
      data.claims,
      data.lifetime,
      data.allowed_clock_skew,
      data.custom_signing_key,
      data.signing_algorithm,
      data.created_at,
      data.updated_at,
    );
  }
}
