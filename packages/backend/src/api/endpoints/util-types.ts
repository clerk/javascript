export type WithSign<T extends string> = `+${T}` | `-${T}` | T;
