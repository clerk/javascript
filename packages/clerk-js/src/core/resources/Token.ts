import type { JWT, TokenJSON, TokenJSONSnapshot, TokenResource } from '@clerk/shared/types';

import { decode } from '@/utils';

import { BaseResource } from './Base';

export class Token extends BaseResource implements TokenResource {
  pathRoot = 'tokens';

  jwt?: JWT;

  static async create(path: string, body: any = {}, search: Record<string, string> = {}): Promise<TokenResource> {
    const json = (await BaseResource._fetch<TokenJSON>({
      method: 'POST',
      path,
      body,
      search,
    })) as unknown as TokenJSON;

    return new Token(json, path);
  }

  constructor(data: TokenJSON | TokenJSONSnapshot | null, pathRoot?: string) {
    super();

    if (pathRoot) {
      this.pathRoot = pathRoot;
    }

    if (data?.jwt) {
      this.jwt = decode(data.jwt);
    }
  }

  getRawString = (): string => {
    return this.jwt?.claims.__raw || '';
  };

  protected fromJSON(data: TokenJSON | TokenJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.jwt = decode(data.jwt);
    return this;
  }

  public __internal_toSnapshot(): TokenJSONSnapshot {
    return {
      object: 'token',
      id: this.id || '',
      jwt: this.getRawString(),
    };
  }
}
