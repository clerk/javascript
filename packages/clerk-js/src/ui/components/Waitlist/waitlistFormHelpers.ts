const FieldKeys = ['emailAddress'];

export type FieldKey = (typeof FieldKeys)[number];

export type Field = {
  required: boolean;
};

export type Fields = {
  [key in FieldKey]: Field | undefined;
};
