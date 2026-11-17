export interface PropDoc {
  type: string;
  doc: string;
  default?: string;
}

export type PropDocs<Props> = { [Key in keyof Props]?: PropDoc };

export interface Practice {
  do: boolean;
  text: string;
}

export interface Example {
  title: string;
  code: string;
}

export interface PartDoc<Props> {
  description: string;
  slot?: string;
  props?: PropDocs<Props>;
}

interface BaseDoc {
  name: string;
  description: string;
  useFor: string[];
  keywords?: string[];
  practices?: Practice[];
  examples?: Example[];
  related?: string[];
}

export interface ComponentDoc<Parts extends Record<string, object>> extends BaseDoc {
  parts: { [Name in keyof Parts]: PartDoc<Parts[Name]> };
}

export interface HookDoc<Options, Result> extends BaseDoc {
  options?: PropDocs<Options>;
  returns: PropDocs<Result>;
}
