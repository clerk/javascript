export type NativeAuthFlowState = {
  isLoaded: boolean;
  isAuthFlowComplete: boolean;
};

export type NativeAuthFlowModule = {
  getAuthFlowState(): Promise<NativeAuthFlowState>;
};

/** Internal transport for native views of the existing Expo owner. */
export type NativeResourceModule = {
  addListener(
    eventName: 'clerkCoreMessage',
    listener: (event: { connectionId: string; message: string }) => void,
  ): { remove(): void };
  addListener(
    eventName: 'clerkNativeAuthFlowChanged',
    listener: (state?: NativeAuthFlowState) => void,
  ): { remove(): void };
  prepareCore(publishableKey: string): Promise<{
    connectionId: string;
    callbackUrl: string;
    platform: 'ios' | 'android';
    capabilities: string[];
  }>;
  startCore(connectionId: string): Promise<void>;
  receiveCoreMessage(connectionId: string, message: string): void;
  detachCore(connectionId: string): void;
  performCoreCapability(
    connectionId: string,
    requestId: string,
    capability: string,
    argumentsJSON: string,
  ): Promise<string>;
  cancelCoreCapabilities(connectionId: string, requestIds: string[]): void;
};
