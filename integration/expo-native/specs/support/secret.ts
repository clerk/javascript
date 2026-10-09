import type { SecretSink } from './types.ts';

const knownValues = new Set<string>();

export function usedSecretValues(): readonly string[] {
  return [...knownValues];
}

export function protect(value: string): void {
  knownValues.add(value);
}

export const SHORTEST_SECRET = 8;

const JWT_START = 'eyJ';
const SHORTEST_JWT_PART = 13;
const SHORTEST_JWT_SIGNATURE = 10;
const SHORTEST_JWT = 2 * SHORTEST_JWT_PART + SHORTEST_JWT_SIGNATURE + 2;

type Span = readonly [number, number];

const inAJwt = (code: number): boolean => (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 45 || code === 46 || code === 95;

function jwtsInRun(run: string, offset: number): readonly Span[] {
  const found: Span[] = [];
  const parts = run.split('.');
  let at = offset;
  for (let n = 0; n + 2 < parts.length; n += 1) {
    const [header, payload, signature] = [parts[n]!, parts[n + 1]!, parts[n + 2]!];
    const starts = header.indexOf(JWT_START);
    if (starts !== -1 && header.length - starts >= SHORTEST_JWT_PART && payload.startsWith(JWT_START) && payload.length >= SHORTEST_JWT_PART && signature.length >= SHORTEST_JWT_SIGNATURE) {
      found.push([at + starts, at + header.length + payload.length + signature.length + 2]);
      at += payload.length + signature.length + 2;
      n += 2;
    }
    at += header.length + 1;
  }
  return found;
}

function jwtsIn(text: string): readonly Span[] {
  const found: Span[] = [];
  let runStart = -1;
  for (let at = 0; at <= text.length; at += 1) {
    if (at < text.length && inAJwt(text.charCodeAt(at))) {
      if (runStart === -1) runStart = at;
      continue;
    }
    if (runStart !== -1 && at - runStart >= SHORTEST_JWT) for (const jwt of jwtsInRun(text.slice(runStart, at), runStart)) found.push(jwt);
    runStart = -1;
  }
  return found;
}

const SCANNED_AT_ONCE = 8 * 1024 * 1024;
const LONGEST_JWT = 64 * 1024;

export function holdsJwt(bytes: Buffer): boolean {
  for (let at = 0; at < bytes.length; at += SCANNED_AT_ONCE - LONGEST_JWT) {
    if (jwtsIn(bytes.toString('latin1', at, at + SCANNED_AT_ONCE)).length > 0) return true;
  }
  return false;
}

export function redact(text: string): string {
  let out = text;
  for (const value of [...knownValues].sort((a, b) => b.length - a.length)) {
    if (out.includes(value)) out = out.split(value).join('<redacted>');
  }
  let safe = '';
  let from = 0;
  for (const [start, end] of jwtsIn(out)) {
    safe += `${out.slice(from, start)}<redacted>`;
    from = end;
  }
  return safe + out.slice(from);
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
