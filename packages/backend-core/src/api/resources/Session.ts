import camelcaseKeys from 'camelcase-keys';

import filterKeys from '../utils/Filter';
import type { SessionJSON } from './JSON';
import { SessionProps } from './Props';

interface SessionPayload extends SessionProps {}

export interface Session extends SessionPayload {}

export class Session {
  static attributes = [
    'id',
    'clientId',
    'userId',
    'status',
    'lastActiveAt',
    'expireAt',
    'abandonAt',
  ];

  static defaults = {};

  constructor(data: Partial<SessionPayload> = {}) {
    Object.assign(this, Session.defaults, data);
  }

  static fromJSON(data: SessionJSON): Session {
    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Session.attributes);
    return new Session(filtered as SessionPayload);
  }
}
