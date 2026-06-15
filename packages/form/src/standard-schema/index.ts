import type { StandardIssue, StandardResult, StandardSchemaV1 } from '../types';

/** Narrow an unknown value to a Standard Schema. */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return typeof value === 'object' && value !== null && '~standard' in value;
}

/** Run a Standard Schema. Returns the result, possibly a promise. */
export function runStandardSchema(
  schema: StandardSchemaV1,
  value: unknown,
): StandardResult<unknown> | Promise<StandardResult<unknown>> {
  return schema['~standard'].validate(value);
}

/** Render a Standard Schema issue path (`['friends', 0, 'name']`) to a field name. */
export function issuePath(issue: StandardIssue): string {
  if (!issue.path || issue.path.length === 0) {
    return '';
  }
  let out = '';
  for (const segment of issue.path) {
    const key = typeof segment === 'object' ? segment.key : segment;
    if (typeof key === 'number') {
      out += `[${key}]`;
    } else {
      out += out === '' ? String(key) : `.${String(key)}`;
    }
  }
  return out;
}
