import type { CookiesJSON } from './JSON';

export class Cookies {
  constructor(readonly cookies: string[]) {}

  static fromJSON(data: CookiesJSON): Cookies {
    return new Cookies(data.cookies);
  }
}
