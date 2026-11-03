import type { DemoInstance } from '../../queries/demo.requests';

export type DemoValues = { name: string };

export type DemoModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'error' }
  | {
      status: 'ready';
      identity: string;
      instance: DemoInstance;
      isRefreshing: boolean;
      refreshFailed: boolean;
      onSave: (values: DemoValues) => Promise<void>;
    };

export type ReadyDemoModel = Extract<DemoModel, { status: 'ready' }>;
