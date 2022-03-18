import { JWT } from './jwt';
import { ClerkResource } from './resource';

export interface TokenResource extends ClerkResource {
  jwt: JWT;
  getRawString: () => string;
}
