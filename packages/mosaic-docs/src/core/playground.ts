import type { PropDocs } from './doc.ts';

export type Control = { kind: 'select'; options: string[] } | { kind: 'switch' } | { kind: 'text' } | { kind: 'none' };

export type PlaygroundValue = string | boolean;

export type PlaygroundValues = Partial<Record<string, PlaygroundValue>>;

export function controlFor(type: string): Control {
  if (type === 'boolean') {
    return { kind: 'switch' };
  }
  if (type === 'string' || type === 'ReactNode') {
    return { kind: 'text' };
  }
  const members = type.split('|').map(member => STRING_LITERAL.exec(member.trim())?.[1]);
  const options = members.filter(member => member !== undefined);
  return options.length > 1 && options.length === members.length ? { kind: 'select', options } : { kind: 'none' };
}

export function playgroundValues(props: PropDocs, defaults: Partial<Record<string, unknown>>): PlaygroundValues {
  const values: PlaygroundValues = {};
  for (const [name, prop] of Object.entries(props)) {
    const value = prop ? documentedDefault(prop.type, prop.default) : undefined;
    if (value !== undefined) {
      values[name] = value;
    }
  }
  for (const [name, value] of Object.entries(defaults)) {
    if (typeof value === 'string' || typeof value === 'boolean') {
      values[name] = value;
    }
  }
  return values;
}

export interface PlaygroundElement {
  element: string;
  props: PlaygroundValues;
  children: PlaygroundNode[];
}

export type PlaygroundNode = string | PlaygroundElement;

export function playgroundContent(defaults: Partial<Record<string, unknown>>): PlaygroundNode[] | undefined {
  const children = defaults.children;
  return typeof children === 'string' || children === undefined ? undefined : parseNodes(children);
}

export function playgroundCode(
  name: string,
  props: PropDocs,
  values: PlaygroundValues,
  content: PlaygroundNode[] = [],
): string {
  const { children, ...rest } = values;
  const attributes = Object.entries(rest).flatMap(([prop, value]) => {
    const doc = props[prop];
    return doc && value === documentedDefault(doc.type, doc.default) ? [] : printAttribute(prop, value);
  });
  const text = typeof children === 'string' && children !== '' ? [children] : content;
  return printElement(name, attributes, text).join('\n');
}

function printElement(name: string, attributes: string[], children: PlaygroundNode[]): string[] {
  const inline = attributes.length <= 1;
  const open = inline ? [`<${[name, ...attributes].join(' ')}`] : [`<${name}`, ...attributes.map(indent)];
  const [only] = children;
  if (children.length === 0) {
    return inline ? [`${open.join('')} />`] : [...open, '/>'];
  }
  if (inline && children.length === 1 && typeof only === 'string') {
    return [`${open.join('')}>${only}</${name}>`];
  }
  const body = children.flatMap(child =>
    typeof child === 'string'
      ? [child]
      : printElement(
          child.element,
          Object.entries(child.props).flatMap(([prop, value]) => printAttribute(prop, value)),
          child.children,
        ),
  );
  return [...(inline ? [`${open.join('')}>`] : [...open, '>']), ...body.map(indent), `</${name}>`];
}

function printAttribute(prop: string, value: PlaygroundValue | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return [value === true ? prop : typeof value === 'string' ? `${prop}='${value}'` : `${prop}={${String(value)}}`];
}

function indent(line: string): string {
  return `  ${line}`;
}

function parseNodes(value: unknown): PlaygroundNode[] {
  const items: unknown[] = Array.isArray(value) ? value : [value];
  return items.flatMap((item): PlaygroundNode[] => {
    if (typeof item === 'string') {
      return [item];
    }
    if (typeof item !== 'object' || item === null || !('__element' in item) || typeof item.__element !== 'string') {
      return [];
    }
    const props: PlaygroundValues = {};
    const raw = 'props' in item && typeof item.props === 'object' && item.props !== null ? item.props : {};
    for (const [prop, propValue] of Object.entries(raw)) {
      if (typeof propValue === 'string' || typeof propValue === 'boolean') {
        props[prop] = propValue;
      }
    }
    const children = 'children' in item && item.children !== undefined ? parseNodes(item.children) : [];
    return [{ element: item.__element, props, children }];
  });
}

const STRING_LITERAL = /^'([^']*)'$/;

function documentedDefault(type: string, raw: string | undefined): PlaygroundValue | undefined {
  const control = controlFor(type);
  if (raw === undefined || control.kind === 'none') {
    return undefined;
  }
  if (control.kind === 'switch') {
    return raw === 'true' ? true : raw === 'false' ? false : undefined;
  }
  const value = STRING_LITERAL.exec(raw)?.[1];
  if (control.kind === 'text') {
    return value;
  }
  return value !== undefined && control.options.includes(value) ? value : undefined;
}
