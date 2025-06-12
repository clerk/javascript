export const clerkCssVar = (name: string, defaultValue: string) => `var(--clerk-${name}, ${defaultValue})`;
