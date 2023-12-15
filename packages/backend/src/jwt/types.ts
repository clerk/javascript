export type JwtReturnType<R, E extends Error> =
  | {
      data: R;
      error?: undefined;
    }
  | {
      data?: undefined;
      error: E;
    };
