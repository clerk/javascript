import type { InstanceJSON } from './JSON';

/** @generateWithEmptyComment */
export class Instance {
  constructor(
    /** The unique identifier for the instance. */
    readonly id: string,
    /** The type of instance environment, either `'production'` or `'development'`. */
    readonly environmentType: string,
    /** For browser-like stacks such as browser extensions, Electron, or Capacitor.js, the instance allowed origins need to be updated with the request origin value. For Chrome extensions popup, background, or service worker pages the origin is `chrome-extension://extension_uiid`. For Electron apps the default origin is `http://localhost:3000`. For Capacitor.js, the origin is `capacitor://localhost`. */
    readonly allowedOrigins: Array<string> | null,
  ) {}

  static fromJSON(data: InstanceJSON): Instance {
    return new Instance(data.id, data.environment_type, data.allowed_origins);
  }
}
