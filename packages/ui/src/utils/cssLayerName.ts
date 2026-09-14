import { logger } from '@clerk/shared/logger';

// ASCII-only <layer-name> so the value can never carry `{`, `}`, `;`, `<` or whitespace into `@layer`.
const CSS_LAYER_NAME_RE = /^-?[A-Za-z_][\w-]*(?:\.-?[A-Za-z_][\w-]*)*$/;

export function isValidCssLayerName(value: unknown): value is string {
  return typeof value === 'string' && CSS_LAYER_NAME_RE.test(value);
}

export function sanitizeCssLayerName(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  if (isValidCssLayerName(value)) {
    return value;
  }
  logger.warnOnce(
    `Clerk: ignoring invalid \`cssLayerName\` ${JSON.stringify(value)}. It must be a CSS layer name such as "clerk" or "app.components".`,
  );
  return undefined;
}
