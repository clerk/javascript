import type { MachineTokenType } from '../tokens/tokenTypes';

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
      tokenType: MachineTokenType;
      errors?: undefined;
    }
  | {
      data?: undefined;
      tokenType: MachineTokenType;
      errors: [E];
    };
