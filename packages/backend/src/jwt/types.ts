import type { TokenEntity } from '../tokens/types';

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
      entity: Exclude<TokenEntity, 'user'>;
      errors?: undefined;
    }
  | {
      data?: undefined;
      entity: Exclude<TokenEntity, 'user'>;
      errors: [E];
    };
