export type APIRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  queryParams?: Record<string, unknown>;
  headerParams?: Record<string, unknown>;
  bodyParams?: object;
} & (
  | {
      url: string;
      path?: string;
    }
  | {
      url?: string;
      path: string;
    }
);

export interface APIClient {
  request: <T>(options: APIRequestOptions) => Promise<T>;
}

export abstract class AbstractAPI {
  constructor(protected APIClient: APIClient) {}

  protected requireId(id: string) {
    if (!id) {
      throw new Error('A valid resource ID is required.');
    }
  }
}
