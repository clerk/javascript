import type { ClerkResourceJSON, ClerkResourceReloadParams } from '@clerk/types';

import type { ApiService, ApiServiceOptions } from './ApiService';

export abstract class BaseResource {
  protected apiService: ApiService;
  protected id?: string;
  protected pathRoot: string;

  constructor(apiService: ApiService, pathRoot: string, id?: string) {
    this.apiService = apiService;
    this.pathRoot = pathRoot;
    this.id = id;
  }

  public isNew(): boolean {
    return !this.id;
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    // Usually a reload is just a GET on the resource path
    const { rotatingTokenNonce } = params || {};
    const data = await this.apiService.get(this.path(), {
      forceUpdateClient: true,
      rotatingTokenNonce,
    });
    return this.fromJSON(data);
  }

  protected path(action?: string): string {
    const base = this.pathRoot;
    if (this.isNew()) {
      return base;
    }
    const baseWithId = base.replace(/[^/]$/, '$&/') + encodeURIComponent(this.id as string);
    if (!action) {
      return baseWithId;
    }
    return baseWithId.replace(/[^/]$/, '$&/') + encodeURIComponent(action);
  }

  protected async baseGet<J extends ClerkResourceJSON | null>(opts: ApiServiceOptions = {}): Promise<this> {
    const data = await this.apiService.get<J>(this.path(), opts);
    return this.fromJSON(data as J);
  }

  protected async basePost<J extends ClerkResourceJSON | null>(
    actionOrBody?: string | any,
    maybeBody?: any,
  ): Promise<this> {
    // Overload resolution: if the first arg is a string, it's an action, otherwise it's a body
    let action: string | undefined;
    let body: any;
    if (typeof actionOrBody === 'string') {
      action = actionOrBody;
      body = maybeBody;
    } else {
      body = actionOrBody;
    }

    const data = await this.apiService.post<J>(this.path(action), body);
    return this.fromJSON(data as J);
  }

  protected async basePut<J extends ClerkResourceJSON | null>(
    actionOrBody?: string | any,
    maybeBody?: any,
  ): Promise<this> {
    let action: string | undefined;
    let body: any;
    if (typeof actionOrBody === 'string') {
      action = actionOrBody;
      body = maybeBody;
    } else {
      body = actionOrBody;
    }

    const data = await this.apiService.put<J>(this.path(action), body);
    return this.fromJSON(data as J);
  }

  protected async basePatch<J extends ClerkResourceJSON | null>(
    actionOrBody?: string | any,
    maybeBody?: any,
  ): Promise<this> {
    let action: string | undefined;
    let body: any;
    if (typeof actionOrBody === 'string') {
      action = actionOrBody;
      body = maybeBody;
    } else {
      body = actionOrBody;
    }

    const data = await this.apiService.patch<J>(this.path(action), body);
    return this.fromJSON(data as J);
  }

  protected async baseDelete<J extends ClerkResourceJSON | null>(action?: string): Promise<void> {
    await this.apiService.delete<J>(this.path(action));
  }

  protected abstract fromJSON(data: ClerkResourceJSON | null): this;
}
