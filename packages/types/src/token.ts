import { JWT } from './jwt';
import { ClerkResource } from './resource';

export type JWTService = 'clerk' | 'hasura' | 'firebase';

export type GetUserTokenOptions = {
  leewayInSeconds?: number;
};

export type GetSessionTokenOptions = {
  leewayInSeconds?: number;
  template?: string;
  throwOnError?: boolean;
  skipCache?: boolean;
};

export interface TokenResource extends ClerkResource {
  jwt: JWT;
  getRawString: () => string;
}
