type KVTuple<T> = {
  [P in keyof T]: T[P] extends 'true' ? boolean : T[P] extends 'false' ? boolean : string;
};

function toUpperSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toUpperCase()}`).replace(/^_/, '');
}

export function propsFromEnv(prefix = '') {
  return (...names: string[]) => {
    const n: string[] = (names || []).flat();

    return n.reduce<KVTuple<any>>((acc, name) => {
      if (!name) {
        return acc;
      }

      const key = toUpperSnakeCase(name);
      const alternateKey = `${prefix}${key}`;
      const value = (process.env[key] || process.env[alternateKey] || '').trim();
      const valueToLowerCase = value.toLowerCase();

      // TODO: Support numbers
      if (valueToLowerCase === 'true') {
        acc[key] = true;
      } else if (valueToLowerCase === 'false') {
        acc[key] = false;
      } else if (valueToLowerCase != '') {
        acc[key] = value;
      }

      acc[name] = value;
      return acc;
    }, {});
  };
}
