export type NativeStorageRequest =
  | { operation: 'read'; key: string }
  | { operation: 'write'; key: string; value: string | null }
  | { operation: 'compareAndSwap'; key: string; expected: string | null; value: string | null };

export type NativeStorage = (request: NativeStorageRequest) => Promise<string | boolean | null>;
