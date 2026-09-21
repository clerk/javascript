export interface WriteOptions {
  replace: boolean;
}

export interface MosaicLocation {
  read: () => string;
  write: (to: string, options: WriteOptions) => Promise<void>;
  subscribe: (listener: () => void) => () => void;
}
