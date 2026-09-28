export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export interface Spec {
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
  getAuthFlowState?(): Promise<NativeAuthFlowState>;
}
