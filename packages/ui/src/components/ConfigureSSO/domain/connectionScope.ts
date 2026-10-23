/** Which connection the wizard is editing. */
export type ConnectionScope = { kind: 'new' } | { kind: 'existing'; id: string };
