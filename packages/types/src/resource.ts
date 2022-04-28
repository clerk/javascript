export type ClerkResourceReloadParams = {
  rotatingTokenNonce?: string;
};

export interface ClerkResource {
  readonly id?: string;
  pathRoot: string;
  reload(p?: ClerkResourceReloadParams): Promise<this>;
}
