type PrimitiveName = 'String' | 'Int' | 'Bool' | 'Date' | 'JSONValue' | 'Double';

export type SwiftRef =
  | { kind: 'named'; name: string }
  | { kind: 'optional'; of: SwiftRef }
  | { kind: 'array'; of: SwiftRef }
  | { kind: 'dict'; of: SwiftRef }
  | { kind: 'primitive'; name: PrimitiveName };

export type SwiftProperty = {
  name: string;
  wireName: string;
  type: SwiftRef;
  isDate: boolean;
};

export type SwiftStruct = {
  kind: 'struct';
  name: string;
  properties: SwiftProperty[];
  identifiable: boolean;
  asClass: boolean;
};

export type SwiftEnum = {
  kind: 'enum';
  name: string;
  cases: { name: string; raw: string }[];
};

export type SwiftDecl = SwiftStruct | SwiftEnum;

export type GeneratedSwiftFile = {
  filename: string;
  contents: string;
};

export type SwiftMethodParam = {
  name: string;
  type: SwiftRef;
  optional: boolean;
};

export type SwiftMethod = {
  jsName: string;
  params: SwiftMethodParam[];
  returnType: SwiftRef | undefined;
};

export type SwiftMethodFacade = {
  owner: string;
  methods: SwiftMethod[];
};

export function optionalize(ref: SwiftRef): SwiftRef {
  if (ref.kind === 'optional') {
    return ref;
  }
  return { kind: 'optional', of: ref };
}

export function isOptionalRef(ref: SwiftRef): boolean {
  return ref.kind === 'optional';
}

export function isDateRef(ref: SwiftRef): boolean {
  if (ref.kind === 'optional') {
    return isDateRef(ref.of);
  }
  return ref.kind === 'primitive' && ref.name === 'Date';
}

export function emitRef(ref: SwiftRef): string {
  switch (ref.kind) {
    case 'named':
      return ref.name;
    case 'optional':
      return `${emitRef(ref.of)}?`;
    case 'array':
      return `[${emitRef(ref.of)}]`;
    case 'dict':
      return `[String: ${emitRef(ref.of)}]`;
    case 'primitive':
      return ref.name;
    default: {
      const _exhaustive: never = ref;
      return _exhaustive;
    }
  }
}
