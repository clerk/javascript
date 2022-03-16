import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { TokenProps } from './Props';
import { TokenJSON } from './JSON';

interface TokenPayload extends TokenProps {}

export class Token {
  static attributes = ['jwt'];

  static defaults = [];

  constructor(data: Partial<TokenProps> = {}) {
    Object.assign(this, Token.defaults, data);
  }

  static fromJSON(data: TokenJSON): Token {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Token.attributes);
    return new Token(filtered as TokenPayload);
  }
}
