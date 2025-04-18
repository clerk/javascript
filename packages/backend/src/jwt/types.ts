import type { NonSessionTokenType } from '../tokens/types';

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
      tokenType: NonSessionTokenType;
      errors?: undefined;
    }
  | {
      data?: undefined;
      tokenType: NonSessionTokenType;
      errors: [E];
    };
