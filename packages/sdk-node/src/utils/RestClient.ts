import got, { HTTPAlias } from 'got';
import deserialize from './Deserializer';
import handleError from './ErrorHandler';
import snakecaseKeys from 'snakecase-keys';
import * as querystring from 'querystring';
import { LIB_NAME, LIB_VERSION } from '../info';

const packageName = LIB_NAME;
const packageVersion = LIB_VERSION;
const packageRepo = 'https://github.com/clerkinc/clerk-sdk-node';
const userAgent = `${packageName}/${packageVersion} (${packageRepo})`;
const contentType = 'application/x-www-form-urlencoded';

type RequestOptions = {
  method: HTTPAlias;
  path: string;
  queryParams?: object;
  bodyParams?: object;
  responseType?: string;
};

export default class RestClient {
  apiKey: string;
  serverApiUrl: string;
  apiVersion: string;
  httpOptions?: object;

  constructor(
    apiKey: string,
    serverApiUrl: string,
    apiVersion: string,
    httpOptions?: object
  ) {
    this.apiKey = apiKey;
    this.serverApiUrl = serverApiUrl;
    this.apiVersion = apiVersion;
    this.httpOptions = httpOptions || {};
  }

  makeRequest(requestOptions: RequestOptions) {
    let url = `${this.serverApiUrl}/${this.apiVersion}${requestOptions.path}`;

    if (requestOptions.queryParams) {
      url = `${url}?${querystring.stringify(
        snakecaseKeys(requestOptions.queryParams)
      )}`;
    }

    // FIXME remove 'any'
    const gotOptions: any = {
      method: requestOptions.method,
      responseType: requestOptions.responseType || 'json',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-type': contentType,
        'user-agent': userAgent,
      },
      ...this.httpOptions,
    };

    if (requestOptions.bodyParams) {
      gotOptions['form'] = snakecaseKeys(requestOptions.bodyParams);
    }

    // TODO improve error handling
    return got(url, gotOptions)
      .then(data =>
        gotOptions.responseType === 'json' ? deserialize(data.body) : data.body
      )
      .catch(error => handleError(error));
  }
}
