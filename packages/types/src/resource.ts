export interface ClerkResource {
  readonly id?: string;
  pathRoot: string;
  reload(): Promise<this>;
}
