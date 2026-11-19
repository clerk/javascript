export interface PropDoc {
  type: string;
  doc: string;
  default?: string;
}

export type PropDocs = Partial<Record<string, PropDoc>>;

export interface PartDoc {
  description: string;
  slot?: string;
  props?: PropDocs;
}

export interface Practice {
  do: boolean;
  text: string;
}

export interface Example {
  title: string;
  code: string;
}

interface BaseDoc {
  name: string;
  description: string;
  useFor: string[];
  practices?: Practice[];
  examples?: Example[];
  related?: string[];
}

export interface ComponentDoc extends BaseDoc {
  parts: Record<string, PartDoc>;
  playground?: { part: string; defaults?: Partial<Record<string, unknown>> };
}

export interface HookDoc extends BaseDoc {
  options?: PropDocs;
  returns: PropDocs;
}

export type Doc = ComponentDoc | HookDoc;
