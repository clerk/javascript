import RestClient from '../utils/RestClient';

export abstract class AbstractApi {
  protected _restClient: RestClient;

  constructor(restClient: RestClient) {
    this._restClient = restClient;
  }

  protected requireId(id: string) {
    if (!id) {
      throw new Error('A valid ID is required.');
    }
  }
}
