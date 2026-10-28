import type { EnvironmentResource } from '@clerk/shared/types';

export class Client {
  static getOrCreateInstance() {
    return { fetch: async () => new Client() };
  }
  constructor(_data?: unknown) {}
}

export class Environment {
  static getInstance() {
    return { fetch: async () => new Environment() };
  }
  constructor(_data?: unknown) {}
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- class/interface merge
export interface Environment extends EnvironmentResource {}
