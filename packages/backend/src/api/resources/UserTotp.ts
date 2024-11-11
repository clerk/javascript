import type { UserTotpJSON } from './JSON';

export class UserTotp {
  constructor(
    readonly object: string,
    readonly id: string,
    readonly secret: string | null,
    readonly uri: string | null,
    readonly verified: boolean,
    readonly backupCodes: string[] | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly additionalProperties: { [key: string]: any },
  ) {}

  static fromJSON(data: UserTotpJSON): UserTotp {
    const { object, id, secret, uri, verified, backup_codes, created_at, updated_at, ...additionalProperties } = data;
    return new UserTotp(object, id, secret, uri, verified, backup_codes, created_at, updated_at, additionalProperties);
  }
}
