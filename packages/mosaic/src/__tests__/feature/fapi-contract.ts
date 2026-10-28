import Ajv2019, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2019';
import { parse } from 'yaml';

import specSource from './fapi-spec.yml?raw';
import { SPEC_GAPS, type SpecGap } from './fapi-spec-gaps';

export async function fapiContractViolations(request: Request, response: Response): Promise<string[]> {
  const url = new URL(request.url);
  const method = (url.searchParams.get('_method') ?? request.method).toLowerCase();
  const path = url.pathname.replace(/(.)\/$/, '$1');
  const endpoint = `${method.toUpperCase()} ${path}`;

  const operation = operations.find(op => op.method === method && op.pattern.test(path));
  if (!operation) {
    return [`${endpoint} is not in the Frontend API spec`];
  }
  const schema = responseSchemaPointer(operation, response.status);
  if (schema === undefined) {
    return [`${endpoint} answered ${response.status}, which the spec does not document`];
  }
  if (!schema || !response.headers.get('content-type')?.includes('json')) {
    return [];
  }
  const validate = validator(schema);
  if (validate(await response.clone().json())) {
    return [];
  }
  return [`${endpoint} ${response.status}: ${[...new Set((validate.errors ?? []).map(describe))].join('; ')}`];
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type JsonObject = Record<string, unknown>;

interface ResponseObject {
  $ref?: string;
  content?: Record<string, unknown>;
}

interface OperationObject {
  responses: Record<string, ResponseObject>;
}

interface Spec {
  paths: Record<string, Partial<Record<Method, OperationObject>>>;
  components: { schemas: Record<string, unknown> };
}

interface Operation {
  method: Method;
  template: string;
  pattern: RegExp;
  responses: Record<string, ResponseObject>;
}

const METHODS: readonly Method[] = ['get', 'post', 'put', 'patch', 'delete'];
const JSON_SCHEMA = 'content/application~1json/schema';
const CLERK_ERRORS = '#/components/schemas/ClerkErrors';

const spec: Spec = parse(specSource);

const operations: Operation[] = Object.entries(spec.paths)
  .flatMap(([template, item]) =>
    METHODS.flatMap(method => {
      const operation = item[method];
      return operation ? [{ method, template, pattern: pathPattern(template), responses: operation.responses }] : [];
    }),
  )
  .sort((a, b) => parameterCount(a.template) - parameterCount(b.template));

const ajv = new Ajv2019({ strict: false, allErrors: true, validateFormats: false, validateSchema: false });
ajv.addSchema(closeObjects(withSpecGaps(spec)), 'fapi');

const validators = new Map<string, ValidateFunction>();

function validator(pointer: string): ValidateFunction {
  const cached = validators.get(pointer);
  if (cached) {
    return cached;
  }
  const validate = ajv.compile({ $ref: `fapi${pointer}` });
  validators.set(pointer, validate);
  return validate;
}

function responseSchemaPointer(operation: Operation, status: number): string | null | undefined {
  const key = [String(status), `${String(status)[0]}XX`, 'default'].find(k => k in operation.responses);
  const response = key === undefined ? undefined : operation.responses[key];
  if (!response || key === undefined) {
    return status >= 400 ? CLERK_ERRORS : undefined;
  }
  if (response.$ref) {
    return `${response.$ref}/${JSON_SCHEMA}`;
  }
  if (!response.content?.['application/json']) {
    return null;
  }
  return `#/paths/${pointerSegment(operation.template)}/${operation.method}/responses/${key}/${JSON_SCHEMA}`;
}

export function staleSpecGaps(gaps: readonly SpecGap[] = SPEC_GAPS): string[] {
  return gaps.flatMap(({ at, property, replaces }) => {
    const schema = resolvePointer(spec, at);
    if (!isObject(schema)) {
      return [`${at} is no longer in the spec`];
    }
    if (replaces) {
      const current = isObject(schema.properties) ? schema.properties[property] : undefined;
      return sameJson(current, replaces) ? [] : [`${at} changed ${property}`];
    }
    return declaredProperties(schema).has(property) ? [`${at} now declares ${property}`] : [];
  });
}

function withSpecGaps(source: Spec): Spec {
  const patched: Spec = structuredClone(source);
  for (const { at, property, schema } of SPEC_GAPS) {
    const target = resolvePointer(patched, at);
    if (isObject(target)) {
      target.properties = { ...(isObject(target.properties) ? target.properties : {}), [property]: schema };
    }
  }
  return patched;
}

function resolvePointer(root: unknown, pointer: string): unknown {
  return pointer
    .replace(/^#\//, '')
    .split('/')
    .map(segment => decodeURIComponent(segment).replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<unknown>((node, key) => (isObject(node) ? node[key] : undefined), root);
}

function declaredProperties(schema: JsonObject): Set<string> {
  const members = Array.isArray(schema.allOf) ? schema.allOf.filter(isObject) : [];
  return new Set(
    [schema, ...members].flatMap(member => (isObject(member.properties) ? Object.keys(member.properties) : [])),
  );
}

function sameJson(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => sameJson(value, b[index]));
  }
  if (isObject(a) && isObject(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => sameJson(a[key], b[key]));
  }
  return a === b;
}

function describe(error: ErrorObject): string {
  return `${error.instancePath || '/'} ${error.message ?? 'is invalid'} ${JSON.stringify(error.params)}`;
}

function closeObjects(source: Spec): Spec {
  const composed = composedComponents(source.components.schemas);
  const schemas = Object.fromEntries(
    Object.entries(source.components.schemas).map(([name, schema]) => [name, closeSchema(schema, composed.has(name))]),
  );
  const paths = Object.fromEntries(
    Object.entries(source.paths).map(([template, item]) => [
      template,
      Object.fromEntries(
        Object.entries(item).map(([method, operation]) => [
          method,
          { ...operation, responses: closeResponses(operation.responses) },
        ]),
      ),
    ]),
  );
  return { ...source, paths, components: { ...source.components, schemas } };
}

function closeResponses(responses: Record<string, ResponseObject>): Record<string, ResponseObject> {
  return Object.fromEntries(
    Object.entries(responses).map(([status, response]) => {
      const json = response.content?.['application/json'];
      if (!isObject(json) || json.schema === undefined) {
        return [status, response];
      }
      return [
        status,
        { ...response, content: { ...response.content, 'application/json': { schema: closeSchema(json.schema) } } },
      ];
    }),
  );
}

function closeSchema(node: unknown, isAllOfMember = false): unknown {
  if (!isObject(node)) {
    return node;
  }
  const schema = { ...node };
  if (isObject(schema.properties)) {
    schema.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, closeSchema(value)]),
    );
  }
  if (isObject(schema.additionalProperties)) {
    schema.additionalProperties = closeSchema(schema.additionalProperties);
  }
  schema.items = closeSchema(schema.items);
  for (const keyword of ['oneOf', 'anyOf'] as const) {
    if (Array.isArray(schema[keyword])) {
      schema[keyword] = schema[keyword].map(member => closeSchema(member));
    }
  }
  if (Array.isArray(schema.allOf)) {
    const composed = schema.allOf.length > 1;
    schema.allOf = schema.allOf.map(member => closeSchema(member, composed));
  }

  const declaresFields = isObject(schema.properties) || (Array.isArray(schema.allOf) && schema.allOf.length > 1);
  if (declaresFields && !isAllOfMember && schema.additionalProperties === undefined) {
    schema.unevaluatedProperties = false;
  }
  if (schema.nullable === true) {
    const { nullable: _nullable, ...nonNull } = schema;
    return { anyOf: [{ type: 'null' }, nonNull] };
  }
  if (schema.items === undefined) {
    delete schema.items;
  }
  return schema;
}

function composedComponents(schemas: Record<string, unknown>): Set<string> {
  const names = new Set<string>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isObject(node)) {
      return;
    }
    if (Array.isArray(node.allOf) && node.allOf.length > 1) {
      for (const member of node.allOf) {
        if (isObject(member) && typeof member.$ref === 'string') {
          names.add(member.$ref.replace('#/components/schemas/', ''));
        }
      }
    }
    Object.values(node).forEach(visit);
  };
  visit(schemas);
  return names;
}

function pathPattern(template: string): RegExp {
  const escaped = template.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

function parameterCount(template: string): number {
  return template.match(/\{/g)?.length ?? 0;
}

function pointerSegment(segment: string): string {
  return encodeURIComponent(segment.replace(/~/g, '~0').replace(/\//g, '~1'));
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
