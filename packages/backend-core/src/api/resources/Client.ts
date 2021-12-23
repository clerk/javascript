import camelcaseKeys from 'camelcase-keys';

import associationDefaults from '../utils/Associations';
import filterKeys from '../utils/Filter';
import { Association } from './Enums';
import type { ClientJSON } from './JSON';
import type { ClientProps } from './Props';
import { Session } from './Session';

interface ClientAssociations {
  sessions: Session[];
}

interface ClientPayload extends ClientProps, ClientAssociations {}

export interface Client extends ClientPayload {}

export class Client {
  static attributes = [
    'id',
    'sessionIds',
    'signUpAttemptId',
    'signInAttemptId',
    'lastActiveSessionId',
    'createdAt',
    'updatedAt',
  ];

  static associations = {
    sessions: Association.HasMany,
  };

  static defaults = {
    ...associationDefaults(Client.associations),
  };

  constructor(data: Partial<ClientPayload> = {}) {
    Object.assign(this, Client.defaults, data);
  }

  static fromJSON(data: ClientJSON): Client {
    const obj: Record<string, any> = {};

    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, Client.attributes);
    Object.assign(obj, filtered);

    obj.sessions = (data.sessions || []).map((x) => Session.fromJSON(x));

    return new Client(obj as ClientPayload);
  }
}
