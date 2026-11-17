export interface Field<T> {
  schema: { type: 'string'; description?: string };
  required: boolean;
  parse: (value: unknown, key: string) => T;
}

export type Shape = Record<string, Field<unknown>>;

export type Input<S extends Shape> = { [K in keyof S]: S[K] extends Field<infer T> ? T : never };

export interface InputSchema {
  type: 'object';
  properties: Record<string, Field<unknown>['schema']>;
  required: string[];
}

export function string(description?: string): Field<string> {
  return {
    schema: description === undefined ? { type: 'string' } : { type: 'string', description },
    required: true,
    parse: (value, key) => {
      if (value === undefined) {
        throw new Error(`${key} is required`);
      }
      if (typeof value !== 'string') {
        throw new Error(`${key} must be a string`);
      }
      return value;
    },
  };
}

export function optional<T>(field: Field<T>): Field<T | undefined> {
  return {
    schema: field.schema,
    required: false,
    parse: (value, key) => (value === undefined ? undefined : field.parse(value, key)),
  };
}

export function inputSchema(shape: Shape | undefined): InputSchema {
  const fields = Object.entries(shape ?? {});
  return {
    type: 'object',
    properties: Object.fromEntries(fields.map(([key, field]) => [key, field.schema])),
    required: fields.filter(([, field]) => field.required).map(([key]) => key),
  };
}

export function parseInput<S extends Shape>(shape: S | undefined, input: object): Input<S> {
  const given = new Map<string, unknown>(Object.entries(input));
  const parsed = Object.fromEntries(
    Object.entries(shape ?? {}).map(([key, field]) => [key, field.parse(given.get(key), key)]),
  );
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Each key of the shape was parsed by its own field, which TypeScript cannot follow through Object.fromEntries.
  return parsed as Input<S>;
}
