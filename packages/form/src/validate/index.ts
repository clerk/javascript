import { isStandardSchema, issuePath, runStandardSchema } from '../standard-schema';
import type { FormValidationResult, StandardSchemaV1, ValidationError } from '../types';

/** Normalize any validator return into a flat `string[]`. Falsy means valid. */
export function normalizeErrors(raw: unknown): string[] {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.flatMap(normalizeErrors);
  }
  if (typeof raw === 'string') {
    return [raw];
  }
  if (typeof raw === 'object') {
    return 'message' in raw ? [String((raw as { message: unknown }).message)] : [];
  }
  if (typeof raw === 'number' || typeof raw === 'boolean' || typeof raw === 'bigint') {
    return [String(raw)];
  }
  // functions / symbols are not meaningful error values
  return [];
}

function maybeThen<In, Out>(value: In | Promise<In>, map: (v: In) => Out): Out | Promise<Out> {
  return value instanceof Promise ? value.then(map) : map(value);
}

// Loose validator shapes. The form module owns the typed surface and casts to
// these at the call site, keeping the deep `AllPaths` path types out of here.
type LooseValidatorFn = (ctx: { value: unknown; signal: AbortSignal }) => ValidationError | Promise<ValidationError>;
type LooseValidator = LooseValidatorFn | StandardSchemaV1;
type LooseCtx = { value: unknown; signal: AbortSignal };

// ---------------------------------------------------------------------------
// Field validators
// ---------------------------------------------------------------------------

/** Run a single field validator (function or schema) → `string[]` (sync or async). */
export function runFieldValidator(validator: LooseValidator, ctx: LooseCtx): string[] | Promise<string[]> {
  if (isStandardSchema(validator)) {
    return maybeThen(runStandardSchema(validator, ctx.value), result =>
      result.issues ? result.issues.map(i => i.message) : [],
    );
  }
  return maybeThen(validator(ctx), normalizeErrors);
}

// ---------------------------------------------------------------------------
// Form validators
// ---------------------------------------------------------------------------

/** Errors produced by a form-level validator, split into form-wide and per-field. */
export interface FormErrors {
  form: string[];
  fields: Record<string, string[]>;
}

function normalizeFormResult(raw: FormValidationResult<unknown> | ValidationError): FormErrors {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && ('form' in raw || 'fields' in raw)) {
    const result: FormValidationResult<unknown> = raw;
    const fields: Record<string, string[]> = {};
    if (result.fields) {
      for (const [key, value] of Object.entries(result.fields)) {
        const errors = normalizeErrors(value);
        if (errors.length) {
          fields[key] = errors;
        }
      }
    }
    return { form: normalizeErrors(result.form), fields };
  }
  return { form: normalizeErrors(raw), fields: {} };
}

type LooseFormValidatorFn = (ctx: {
  value: unknown;
  signal: AbortSignal;
}) => FormValidationResult<unknown> | ValidationError | Promise<FormValidationResult<unknown> | ValidationError>;
type LooseFormValidator = LooseFormValidatorFn | StandardSchemaV1;

/** Run a single form validator (function or schema) → `FormErrors` (sync or async). */
export function runFormValidator(validator: LooseFormValidator, ctx: LooseCtx): FormErrors | Promise<FormErrors> {
  if (isStandardSchema(validator)) {
    return maybeThen(runStandardSchema(validator, ctx.value), result => {
      const out: FormErrors = { form: [], fields: {} };
      if (result.issues) {
        for (const issue of result.issues) {
          const path = issuePath(issue);
          if (path === '') {
            out.form.push(issue.message);
          } else {
            (out.fields[path] ??= []).push(issue.message);
          }
        }
      }
      return out;
    });
  }
  return maybeThen(validator(ctx), normalizeFormResult);
}
