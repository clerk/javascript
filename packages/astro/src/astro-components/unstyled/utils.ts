/**
 * This function is used when an element is passed as a default slot and we need
 * to add an attribute to it so that we can reference it in a click listener.
 */
export function addUnstyledAttributeToFirstTag(html: string, attributeValue: string): string {
  return html.replace(/(<[^>]+)>/, `$1 data-clerk-unstyled-id="${attributeValue}">`);
}

/**
 * Logs a deprecation warning when the 'as' prop is used.
 */
export function logAsPropUsageDeprecation() {
  if (import.meta.env.PROD) {
    return;
  }

  console.warn(
    `[@clerk/astro] The 'as' prop is deprecated and will be removed in a future version. ` +
      `Use the default slot with the 'asChild' prop instead. `,
  );
}
