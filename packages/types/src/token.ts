import type { JWT } from './jwt';
import type { ClerkResource } from './resource';

export interface TokenResource extends ClerkResource {
  jwt: JWT;
  getRawString: () => string;
}
