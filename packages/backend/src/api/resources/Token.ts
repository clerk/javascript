import { TokenJSON } from './JSON';

export class Token {
  constructor(readonly jwt: string) {}

  static fromJSON(data: TokenJSON): Token {
    return new Token(data.jwt);
  }
}
