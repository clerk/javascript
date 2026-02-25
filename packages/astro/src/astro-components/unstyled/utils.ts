/**
 * This function is used when an element is passed as a default slot and we need
 * to add an attribute to it so that we can reference it in a click listener.
 */
export function addUnstyledAttributeToFirstTag(html: string, attributeValue: string): string {
  return html.replace(/(<[^>]+)>/, `$1 data-clerk-unstyled-id="${attributeValue}">`);
}
