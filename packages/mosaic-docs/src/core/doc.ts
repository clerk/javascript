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

interface BaseDoc {
  name: string;
  description: string;
  useFor: string[];
  practices?: { do: boolean; text: string }[];
  examples?: { title: string; code: string }[];
  related?: string[];
}

export interface ComponentDoc extends BaseDoc {
  parts: Record<string, PartDoc>;
}

export interface HookDoc extends BaseDoc {
  options?: PropDocs;
  returns: PropDocs;
}

export type Doc = ComponentDoc | HookDoc;
