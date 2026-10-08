import type { SecretSink } from './types.ts';

const knownValues = new Set<string>();

export function usedSecretValues(): readonly string[] {
  return [...knownValues];
}

export function protect(value: string): void {
  knownValues.add(value);
}

export function redact(text: string): string {
  let out = text;
  for (const value of knownValues) {
    if (out.includes(value)) out = out.split(value).join('<redacted>');
  }
  return out;
}

export class Secret<Name extends string> {
  readonly name: Name;
  #value: string;
  constructor(name: Name, value: string) {
    this.name = name;
    this.#value = value;
    protect(value);
  }
  toString(): string {
    return `<secret:${this.name}>`;
  }
  toJSON(): string {
    return `<secret:${this.name}>`;
  }
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `<secret:${this.name}>`;
  }
  use<T>(_sink: SecretSink, fn: (plain: string) => T): T {
    return fn(this.#value);
  }
}
