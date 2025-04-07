const _FieldKeys = ['emailAddress'];

export type FieldKey = (typeof _FieldKeys)[number];

export type Field = {
  required: boolean;
};

export type Fields = {
  [key in FieldKey]: Field | undefined;
};
