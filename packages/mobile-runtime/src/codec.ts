import { schema } from '../../native-bindings/generated/schema.mjs';
import { bridgeError, type Handle, type JSONValue } from './protocol.ts';

export type Shape = { kind: string; [key: string]: any };
export interface ResourceCodec {
  reference(value: object, type: string): Handle;
  resolve(handle: Handle, type: string): object;
}

function invalid(): never {
  throw bridgeError('invalid_bridge_value');
}
function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function matches(shape: Shape, value: unknown, depth = 0): boolean {
  if (depth > 64) return false;
  if (shape.kind === 'ref') return matches(schema[shape.name], value, depth + 1);
  switch (shape.kind) {
    case 'optional':
      return value === undefined
        ? shape.omittable
        : value === null
          ? shape.nullable
          : matches(shape.value, value, depth + 1);
    case 'undefined':
    case 'void':
      return value === undefined;
    case 'null':
      return value === null;
    case 'never':
      return false;
    case 'boolean':
      return typeof value === 'boolean';
    case 'string':
    case 'enum':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'literal':
      return value === shape.value;
    case 'array':
      return Array.isArray(value) && value.every(v => matches(shape.element, v, depth + 1));
    case 'tuple':
      return (
        Array.isArray(value) &&
        value.length === shape.elements.length &&
        value.every((v, i) => matches(shape.elements[i], v, depth + 1))
      );
    case 'union':
      return shape.variants.some((s: Shape) => matches(s, value, depth + 1));
    case 'date':
      return value instanceof Date;
    case 'url':
      return value instanceof URL;
    case 'binary':
      return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
    case 'file':
      return typeof Blob !== 'undefined' && value instanceof Blob;
    case 'json':
      return true;
    case 'jsonObject':
      return isObject(value);
    case 'dictionary':
      return (
        isObject(value) &&
        (shape.requiredKeys || []).every((key: string) => Object.hasOwn(value, key)) &&
        Object.values(value).every(v => matches(shape.value, v, depth + 1))
      );
    case 'resource':
      return (
        isObject(value) &&
        shape.properties
          .filter((p: any) => p.type.kind === 'literal')
          .every((p: any) => matches(p.type, value[p.name], depth + 1))
      );
    case 'object':
      return (
        isObject(value) &&
        shape.properties.every(
          (p: any) => (value[p.name] === undefined && p.optional) || matches(p.type, value[p.name], depth + 1),
        )
      );
    default:
      return false;
  }
}

function json(value: unknown, depth = 0): JSONValue {
  if (depth > 64) invalid();
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(v => json(v, depth + 1));
  if (isObject(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, json(v, depth + 1)]));
  }
  return invalid();
}

export function encode(shape: Shape, value: any, resources: ResourceCodec, depth = 0): JSONValue {
  if (depth > 64) invalid();
  if (shape.kind === 'ref') return encode(schema[shape.name], value, resources, depth + 1);
  if (shape.kind === 'optional') {
    if (value === undefined && shape.omittable) return { $undefined: true };
    if (value === null && shape.nullable) return null;
    return encode(shape.value, value, resources, depth + 1);
  }
  if (!matches(shape, value)) invalid();
  switch (shape.kind) {
    case 'void':
    case 'undefined':
      return { $undefined: true };
    case 'resource':
      return { $ref: resources.reference(value, shape.name) as unknown as JSONValue };
    case 'date':
      return value.toISOString();
    case 'url':
      return value.toString();
    case 'array':
      return value.map((v: any) => encode(shape.element, v, resources, depth + 1));
    case 'tuple':
      return value.map((v: any, i: number) => encode(shape.elements[i], v, resources, depth + 1));
    case 'union': {
      const index = shape.variants.findIndex((s: Shape) => matches(s, value));
      return { $case: index, value: encode(shape.variants[index], value, resources, depth + 1) };
    }
    case 'object': {
      const output: Record<string, JSONValue> = {};
      for (const p of shape.properties) {
        if (value[p.name] === undefined && p.optional) continue;
        output[p.name] = encode(p.type, value[p.name], resources, depth + 1);
      }
      if (shape.index)
        for (const key of Object.keys(value)) {
          if (!(key in output)) output[key] = encode(shape.index, value[key], resources, depth + 1);
        }
      return output;
    }
    case 'dictionary':
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, encode(shape.value, v, resources, depth + 1)]),
      );
    case 'json':
    case 'jsonObject':
      return json(value);
    case 'binary': {
      const bytes =
        value instanceof ArrayBuffer
          ? new Uint8Array(value)
          : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      return { base64: btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join('')) };
    }
    case 'file':
      return invalid();
    default:
      return value;
  }
}

export function decode(shape: Shape, value: any, resources: ResourceCodec, depth = 0): any {
  if (depth > 64) invalid();
  if (shape.kind === 'ref') return decode(schema[shape.name], value, resources, depth + 1);
  switch (shape.kind) {
    case 'optional':
      if (isObject(value) && value.$undefined === true && shape.omittable) return undefined;
      if (value === undefined && shape.omittable) return undefined;
      if (value === null && shape.nullable) return null;
      return decode(shape.value, value, resources, depth + 1);
    case 'void':
    case 'undefined':
      if (value === undefined || (isObject(value) && value.$undefined === true)) return undefined;
      return invalid();
    case 'resource':
      if (!isObject(value) || !isObject(value.$ref)) invalid();
      return resources.resolve(value.$ref as Handle, shape.name);
    case 'date': {
      const date = new Date(value);
      if (typeof value !== 'string' || !Number.isFinite(date.getTime())) invalid();
      return date;
    }
    case 'url':
      if (typeof value !== 'string') invalid();
      return new URL(value);
    case 'array':
      if (!Array.isArray(value)) invalid();
      return value.map(v => decode(shape.element, v, resources, depth + 1));
    case 'tuple':
      if (!Array.isArray(value) || value.length !== shape.elements.length) invalid();
      return value.map((v, i) => decode(shape.elements[i], v, resources, depth + 1));
    case 'union': {
      if (!isObject(value) || !Number.isInteger(value.$case) || !shape.variants[value.$case]) invalid();
      return decode(shape.variants[value.$case], value.value, resources, depth + 1);
    }
    case 'object': {
      if (!isObject(value)) invalid();
      const output: Record<string, unknown> = {};
      for (const p of shape.properties) {
        if (!(p.name in value) && p.optional) continue;
        output[p.name] = decode(p.type, value[p.name], resources, depth + 1);
      }
      for (const key of Object.keys(value))
        if (!shape.properties.some((p: any) => p.name === key)) {
          if (!shape.index) invalid();
          output[key] = decode(shape.index, value[key], resources, depth + 1);
        }
      return output;
    }
    case 'dictionary':
      if (!isObject(value) || (shape.requiredKeys || []).some((key: string) => !Object.hasOwn(value, key))) invalid();
      if (
        shape.keys &&
        !shape.keys.open &&
        Object.keys(value).some(
          key =>
            !shape.keys.values.includes(key) &&
            !shape.keys.patterns.some((pattern: string) => new RegExp(pattern).test(key)),
        )
      )
        invalid();
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, decode(shape.value, v, resources, depth + 1)]),
      );
    case 'json':
      return json(value);
    case 'jsonObject':
      if (!isObject(value)) invalid();
      return json(value);
    case 'binary':
      if (!isObject(value) || typeof value.base64 !== 'string') invalid();
      return Uint8Array.from(atob(value.base64), c => c.charCodeAt(0));
    case 'file': {
      if (
        !isObject(value) ||
        typeof value.base64 !== 'string' ||
        typeof value.name !== 'string' ||
        typeof value.contentType !== 'string'
      )
        invalid();
      return new File([Uint8Array.from(atob(value.base64), c => c.charCodeAt(0))], value.name, {
        type: value.contentType,
      });
    }
    case 'enum':
      if (
        typeof value !== 'string' ||
        !(
          shape.open ||
          shape.values.includes(value) ||
          shape.patterns?.some((pattern: string) => new RegExp(pattern).test(value))
        )
      )
        invalid();
      return value;
    case 'string':
      if (typeof value !== 'string' || (shape.pattern && !new RegExp(shape.pattern).test(value))) invalid();
      return value;
    default:
      if (!matches(shape, value)) invalid();
      return value;
  }
}
