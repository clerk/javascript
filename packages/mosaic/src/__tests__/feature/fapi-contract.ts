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
  return [
    ...queryViolations(endpoint, operation, url.searchParams),
    ...(await bodyViolations(endpoint, operation, request)),
    ...(await responseViolations(endpoint, operation, response)),
  ];
}

function queryViolations(endpoint: string, operation: Operation, query: URLSearchParams): string[] {
  return violations(`${endpoint} query`, formValidator(`${operation.pointer}/${QUERY_SCHEMA}`), formFields(query));
}

async function bodyViolations(endpoint: string, operation: Operation, request: Request): Promise<string[]> {
  const body = await request.clone().text();
  const requestBody = operation.definition.requestBody;
  if (!body) {
    return requestBody?.required ? [`${endpoint} sent no body, which the spec requires`] : [];
  }
  if (!requestBody?.content) {
    return [`${endpoint} sent a body, which the spec does not document`];
  }
  const contentType = request.headers.get('content-type')?.split(';')[0] ?? '';
  if (!(contentType in requestBody.content)) {
    return [`${endpoint} sent ${contentType || 'a body without a content type'}, which the spec does not document`];
  }
  const schema = `${operation.pointer}/requestBody/content/${pointerSegment(contentType)}/schema`;
  const label = `${endpoint} body`;
  switch (contentType) {
    case 'application/json':
      return violations(label, validator(schema), JSON.parse(body));
    case 'application/x-www-form-urlencoded':
      return violations(label, formValidator(schema), formFields(new URLSearchParams(body)));
    case 'multipart/form-data':
      return violations(label, formValidator(schema), formFields(await request.clone().formData()));
    default:
      return [];
  }
}

async function responseViolations(endpoint: string, operation: Operation, response: Response): Promise<string[]> {
  const schema = responseSchemaPointer(operation, response.status);
  if (schema === undefined) {
    return [`${endpoint} answered ${response.status}, which the spec does not document`];
  }
  if (!schema || !response.headers.get('content-type')?.includes('json')) {
    return [];
  }
  return violations(`${endpoint} ${response.status}`, validator(schema), await response.clone().json());
}

function violations(label: string, validate: ValidateFunction, data: unknown): string[] {
  if (validate(data)) {
    return [];
  }
  return [`${label}: ${[...new Set((validate.errors ?? []).map(describe))].join('; ')}`];
}

function formFields(entries: URLSearchParams | FormData): Record<string, string | string[]> {
  const fields: Record<string, string | string[]> = {};
  entries.forEach((entry, key) => {
    const value = typeof entry === 'string' ? entry : entry.name;
    const existing = fields[key];
    fields[key] = existing === undefined ? value : [...(Array.isArray(existing) ? existing : [existing]), value];
  });
  return fields;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type JsonObject = Record<string, unknown>;

interface ResponseObject {
  $ref?: string;
  content?: Record<string, unknown>;
}

interface ParameterObject {
  $ref?: string;
  name?: string;
  in?: string;
  required?: boolean;
  schema?: unknown;
}

interface OperationObject {
  parameters?: ParameterObject[];
  requestBody?: { required?: boolean; content?: Record<string, unknown> };
  responses: Record<string, ResponseObject>;
  [QUERY_SCHEMA]?: unknown;
}

interface Spec {
  paths: Record<string, Partial<Record<Method, OperationObject>>>;
  components: { schemas: Record<string, unknown> };
}

interface Operation {
  method: Method;
  template: string;
  pattern: RegExp;
  pointer: string;
  definition: OperationObject;
}

const METHODS: readonly Method[] = ['get', 'post', 'put', 'patch', 'delete'];
const JSON_SCHEMA = 'content/application~1json/schema';
const QUERY_SCHEMA = 'x-query-schema';
const CLERK_ERRORS = '#/components/schemas/ClerkErrors';
const EXCLUSIVE_BOUNDS = [
  ['exclusiveMinimum', 'minimum'],
  ['exclusiveMaximum', 'maximum'],
] as const;
const TRANSPORT_PARAMS = [
  '__clerk_api_version',
  '_clerk_js_version',
  '_clerk_session_id',
  '_clerk_retry_attempt',
  '_method',
  '__domain',
  'rotating_token_nonce',
];

const spec: Spec = parse(specSource);

const operations: Operation[] = Object.entries(spec.paths)
  .flatMap(([template, item]) =>
    METHODS.flatMap(method => {
      const definition = item[method];
      const pointer = `#/paths/${pointerSegment(template)}/${method}`;
      return definition ? [{ method, template, pattern: pathPattern(template), pointer, definition }] : [];
    }),
  )
  .sort((a, b) => parameterCount(a.template) - parameterCount(b.template));

const specWithQueries = withQuerySchemas(spec);
const contract = closeObjects(withSpecGaps(specWithQueries));
const ajvOptions = { strict: false, allErrors: true, validateFormats: false, validateSchema: false };
const validator = compiler(new Ajv2019(ajvOptions).addSchema(contract, 'fapi'));
const formValidator = compiler(new Ajv2019({ ...ajvOptions, coerceTypes: 'array' }).addSchema(contract, 'fapi'));

function compiler(ajv: Ajv2019): (pointer: string) => ValidateFunction {
  const validators = new Map<string, ValidateFunction>();
  return pointer => {
    const cached = validators.get(pointer);
    if (cached) {
      return cached;
    }
    const validate = ajv.compile({ $ref: `fapi${pointer}` });
    validators.set(pointer, validate);
    return validate;
  };
}

function responseSchemaPointer(operation: Operation, status: number): string | null | undefined {
  const { responses } = operation.definition;
  const key = [String(status), `${String(status)[0]}XX`, 'default'].find(k => k in responses);
  const response = key === undefined ? undefined : responses[key];
  if (!response || key === undefined) {
    return status >= 400 ? CLERK_ERRORS : undefined;
  }
  if (response.$ref) {
    return `${response.$ref}/${JSON_SCHEMA}`;
  }
  if (!response.content?.['application/json']) {
    return null;
  }
  return `${operation.pointer}/responses/${key}/${JSON_SCHEMA}`;
}

export function staleSpecGaps(gaps: readonly SpecGap[] = SPEC_GAPS): string[] {
  return gaps.flatMap(({ at, property, replaces }) => {
    const schema = resolvePointer(specWithQueries, at);
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

function withQuerySchemas(source: Spec): Spec {
  const paths = Object.fromEntries(
    Object.entries(source.paths).map(([template, item]) => [
      template,
      Object.fromEntries(
        Object.entries(item).map(([method, operation]) => [
          method,
          { ...operation, [QUERY_SCHEMA]: querySchema(source, operation.parameters ?? []) },
        ]),
      ),
    ]),
  );
  return { ...source, paths };
}

function querySchema(source: Spec, parameters: ParameterObject[]): unknown {
  const query = parameters
    .map(parameter => (parameter.$ref ? resolvePointer(source, parameter.$ref) : parameter))
    .filter(isObject)
    .filter(parameter => parameter.in === 'query' && typeof parameter.name === 'string');
  return {
    type: 'object',
    properties: {
      ...Object.fromEntries(TRANSPORT_PARAMS.map(name => [name, { type: 'string' }])),
      ...Object.fromEntries(query.map(parameter => [parameter.name, parameter.schema ?? {}])),
    },
    required: query.filter(parameter => parameter.required === true).map(parameter => parameter.name),
    additionalProperties: false,
  };
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
          {
            ...operation,
            requestBody: closeRequestBody(operation.requestBody),
            responses: closeResponses(operation.responses),
          },
        ]),
      ),
    ]),
  );
  return { ...source, paths, components: { ...source.components, schemas } };
}

function closeRequestBody(requestBody: OperationObject['requestBody']): OperationObject['requestBody'] {
  if (!requestBody?.content) {
    return requestBody;
  }
  const content = Object.fromEntries(
    Object.entries(requestBody.content).map(([type, media]) => [
      type,
      isObject(media) ? { ...media, schema: closeSchema(media.schema) } : media,
    ]),
  );
  return { ...requestBody, content };
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
  for (const [exclusive, bound] of EXCLUSIVE_BOUNDS) {
    if (schema[exclusive] === true) {
      schema[exclusive] = schema[bound];
      delete schema[bound];
    } else if (schema[exclusive] === false) {
      delete schema[exclusive];
    }
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
