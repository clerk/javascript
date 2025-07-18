import type { InstanceJSON } from './JSON';

export class Instance {
  constructor(
    readonly id: string,
    readonly environmentType: string,
    readonly allowedOrigins: Array<string> | null,
  ) {}

  static fromJSON(data: InstanceJSON): Instance {
    return new Instance(data.id, data.environment_type, data.allowed_origins);
  }
}
