import { ClerkJWTClaims, JWTHeader } from '@clerk/types';
export interface JWT {
  header: JWTHeader;
  payload: ClerkJWTClaims;
  signature: string;
}
