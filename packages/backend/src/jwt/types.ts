export type JwtReturnType<R, E extends Error> =
  | {
      data: R;
      errors?: undefined;
    }
  | {
      data?: undefined;
      errors: [E];
    };
