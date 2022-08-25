export type ClerkResourceReloadParams = {
  rotatingTokenNonce?: string;
};

export interface ClerkResource {
  readonly id?: string | undefined;
  pathRoot: string;
  reload(p?: ClerkResourceReloadParams): Promise<this>;
}
