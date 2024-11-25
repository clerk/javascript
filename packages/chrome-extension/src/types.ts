export const SCOPE = {
  BACKGROUND: 'background',
} as const;

export type Scope = (typeof SCOPE)[keyof typeof SCOPE];

export interface ClerkClientExtensionFeatures {
  background?: boolean;
  sync?: boolean;
}
