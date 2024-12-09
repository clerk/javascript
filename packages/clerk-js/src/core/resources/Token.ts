import type { JWT, TokenJSON, TokenResource } from '@clerk/types';

import { decode } from '../../utils';
import { BaseResource } from './internal';

export class Token extends BaseResource implements TokenResource {
  pathRoot = 'tokens';

  jwt?: JWT;

  static async create(path: string, body: any = {}): Promise<TokenResource> {
    const json = (await BaseResource._fetch<TokenJSON>({
      path,
      method: 'POST',
      body,
    })) as unknown as TokenJSON;

    return new Token(json, path);
  }

  constructor(data: TokenJSON | null, pathRoot?: string) {
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

  protected fromJSON(data: TokenJSON | null): this {
    if (!data) {
      return this;
    }

    this.jwt = decode(data.jwt);
    return this;
  }

  public toJSON(): TokenJSON {
    return {
      object: 'token',
      id: this.id || '',
      jwt: this.getRawString(),
    };
  }
}
