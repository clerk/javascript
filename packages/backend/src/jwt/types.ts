import type { TokenType } from '../tokens/types';

export type JwtReturnType<R, E extends Error> =
  | {
      data: R;
      errors?: undefined;
    }
  | {
      data?: undefined;
      errors: [E];
    };

export type MachineTokenReturnType<R, E extends Error> =
  | {
      data: R;
      tokenType: Exclude<TokenType, 'session_token'>;
      errors?: undefined;
    }
  | {
      data?: undefined;
      tokenType: Exclude<TokenType, 'session_token'>;
      errors: [E];
    };
