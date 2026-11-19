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

export interface PlaygroundElement {
  __element: string;
  props?: Record<string, string | boolean>;
  children?: PlaygroundChildren;
}

export type PlaygroundChildren = string | PlaygroundElement | (string | PlaygroundElement)[];

export type Playground<Parts> = {
  [Name in keyof Parts]: {
    part: Name;
    defaults?: { [Prop in keyof Parts[Name]]?: Prop extends 'children' ? PlaygroundChildren : Parts[Name][Prop] };
  };
}[keyof Parts];

export interface ExportDoc {
  description: string;
}

interface BaseDoc {
  name: string;
  description: string;
  useFor: string[];
  keywords?: string[];
  practices?: Practice[];
  examples?: Example[];
  related?: string[];
  exports?: Record<string, ExportDoc>;
}

export interface ComponentDoc<Parts extends Record<string, object>> extends BaseDoc {
  parts: { [Name in keyof Parts]: PartDoc<Parts[Name]> };
  playground?: Playground<Parts>;
}

export interface HookDoc<Options, Result> extends BaseDoc {
  options?: PropDocs<Options>;
  returns: PropDocs<Result>;
}
