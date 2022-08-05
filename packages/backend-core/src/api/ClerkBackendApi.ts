import snakecaseKeys from 'snakecase-keys';

import { joinPaths } from '../util/path';
import { APIClient, APIRequestOptions } from './endpoints';
import {
  AllowlistIdentifierAPI,
  ClientAPI,
  EmailAPI,
  InvitationAPI,
  OrganizationAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  SMSMessageAPI,
  UserAPI,
} from './endpoints';
import { MISSING_API_CLIENT_ERROR, MISSING_API_KEY } from './errors';
import { deserialize } from './resources/Deserializer';

const DEFAULT_API_KEY = process.env.CLERK_API_KEY || '';
const DEFAULT_API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
const DEFAULT_API_VERSION = process.env.CLERK_API_VERSION || 'v1';

const INTERSTITIAL_URL = `${DEFAULT_API_URL}/${DEFAULT_API_VERSION}/internal/interstitial`;

type ClerkBackendAPIOptions = {
  /* Backend API Client (not specific to window.fetch API)
   * The fetcher implementation should return the response body, not the whole response.
   */
  apiClient: APIClient;
  /* Backend API key */
  apiKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  libName: string;
  /* Library/SDK semver version string */
  libVersion: string;
};

export class ClerkBackendAPI {
  private _allowlistIdentifierAPI?: AllowlistIdentifierAPI;
  private _clientAPI?: ClientAPI;
  private _emailAPI?: EmailAPI;
  private _invitationAPI?: InvitationAPI;
  private _organizationAPI?: OrganizationAPI;
  private _redirectUrlAPI?: RedirectUrlAPI;
  private _sessionAPI?: SessionAPI;
  private _signInTokenAPI?: SignInTokenAPI;
  private _smsMessageAPI?: SMSMessageAPI;
  private _userAPI?: UserAPI;

  apiClient: APIClient;
  apiKey: string;
  apiUrl: string;
  apiVersion: string;
  userAgent: string;

  constructor(public options: ClerkBackendAPIOptions) {
    const {
      apiClient,
      apiKey = DEFAULT_API_KEY,
      apiUrl = DEFAULT_API_URL,
      apiVersion = DEFAULT_API_VERSION,
      libName,
      libVersion,
    } = options;

    if (!apiClient) {
      throw Error(MISSING_API_CLIENT_ERROR);
    }

    this.apiClient = apiClient;
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.apiVersion = apiVersion;

    this.userAgent = `${libName}@${libVersion}`;
  }

  async request<T>(requestOptions: APIRequestOptions) {
    if (!this.apiKey) {
      throw Error(MISSING_API_KEY);
    }

    const { path, method } = requestOptions;
    const url = joinPaths(this.apiUrl, this.apiVersion, path);

    const newRequestOptions = { method, url } as APIRequestOptions;

    newRequestOptions.queryParams = snakecaseKeys({
      ...this.getDefaultQueryParams(),
      ...requestOptions.queryParams,
    });

    newRequestOptions.headerParams = {
      ...this.getDefaultHeadersParams(),
      ...requestOptions.headerParams,
    };

    newRequestOptions.bodyParams = snakecaseKeys(
      {
        ...this.getDefaultBodyParams(),
        ...requestOptions.bodyParams,
      },
      { deep: false },
    );

    const data = await this.apiClient.request<T>(newRequestOptions);

    return deserialize(data) as T;
  }

  fetchInterstitial() {
    return this.apiClient.request<string>({
      url: INTERSTITIAL_URL,
      method: 'GET',
      headerParams: {
        ...this.getDefaultHeadersParams(),
        'Content-Type': 'text/html',
      },
    });
  }

  getDefaultQueryParams() {
    return {};
  }

  getDefaultHeadersParams() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': this.userAgent,
      'X-Clerk-SDK': this.userAgent,
    };
  }

  getDefaultBodyParams() {
    return {};
  }

  // Lazy sub-API getters
  get allowlistIdentifiers(): AllowlistIdentifierAPI {
    if (!this._allowlistIdentifierAPI) {
      this._allowlistIdentifierAPI = new AllowlistIdentifierAPI(this);
    }
    return this._allowlistIdentifierAPI;
  }

  get clients(): ClientAPI {
    if (!this._clientAPI) {
      this._clientAPI = new ClientAPI(this);
    }

    return this._clientAPI;
  }

  get emails(): EmailAPI {
    if (!this._emailAPI) {
      this._emailAPI = new EmailAPI(this);
    }

    return this._emailAPI;
  }

  get invitations(): InvitationAPI {
    if (!this._invitationAPI) {
      this._invitationAPI = new InvitationAPI(this);
    }
    return this._invitationAPI;
  }

  get organizations(): OrganizationAPI {
    if (!this._organizationAPI) {
      this._organizationAPI = new OrganizationAPI(this);
    }
    return this._organizationAPI;
  }

  get redirectUrls(): RedirectUrlAPI {
    if (!this._redirectUrlAPI) {
      this._redirectUrlAPI = new RedirectUrlAPI(this);
    }
    return this._redirectUrlAPI;
  }

  get sessions(): SessionAPI {
    if (!this._sessionAPI) {
      this._sessionAPI = new SessionAPI(this);
    }

    return this._sessionAPI;
  }

  get signInTokens(): SignInTokenAPI {
    if (!this._signInTokenAPI) {
      this._signInTokenAPI = new SignInTokenAPI(this);
    }
    return this._signInTokenAPI;
  }

  get smsMessages(): SMSMessageAPI {
    if (!this._smsMessageAPI) {
      this._smsMessageAPI = new SMSMessageAPI(this);
    }

    return this._smsMessageAPI;
  }

  get users(): UserAPI {
    if (!this._userAPI) {
      this._userAPI = new UserAPI(this);
    }

    return this._userAPI;
  }
}
