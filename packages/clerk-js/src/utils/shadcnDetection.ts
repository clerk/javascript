/**
 * Utility function for detecting shadcn/ui usage based on CSS variables
 */
export function detectShadcnUsage(): boolean {
  const shadcnCSSVariables = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
  ];

  let foundVariables = 0;
  const totalVariables = shadcnCSSVariables.length;

  // Check if CSS variables are defined in the document
  const computedStyle = getComputedStyle(document.documentElement);

  for (const variable of shadcnCSSVariables) {
    const value = computedStyle.getPropertyValue(variable);
    if (value && value.trim() !== '') {
      foundVariables++;
    }
  }

  // If we find more than 80% of the expected variables, it's likely shadcn
  const threshold = 0.8;
  return foundVariables >= totalVariables * threshold;
}
