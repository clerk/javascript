import RestClient from '../utils/RestClient';

export abstract class AbstractApi {
  protected _restClient: RestClient;

  constructor(restClient: RestClient) {
    this._restClient = restClient;
  }
}
