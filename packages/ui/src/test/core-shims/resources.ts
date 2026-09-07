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
