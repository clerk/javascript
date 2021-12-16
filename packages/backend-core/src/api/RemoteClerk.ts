import {
  AllowlistIdentifierApi,
  ClientApi,
  EmailApi,
  InvitationApi,
  SessionApi,
  SMSMessageApi,
  UserApi,
} from './collection';
import RestClient, { ClerkFetcher } from './utils/RestClient';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl =
  process.env.CLERK_API_URL || 'https://api.clerk.dev';

type RemoteClerkProps = {
  apiKey?: string;
  serverApiUrl?: string;
  apiVersion?: string;
  fetcher: ClerkFetcher;
  libName: string;
  libVersion: string;
  packageRepo: string;
};

export class RemoteClerk {
  private _restClient: RestClient;
  // singleton instance
  static _instance: RemoteClerk;

  // TODO we may not need to instantiate these any more if they keep no state
  // private api instances
  private _allowlistIdentifierApi?: AllowlistIdentifierApi;
  private _clientApi?: ClientApi;
  private _emailApi?: EmailApi;
  private _invitationApi?: InvitationApi;
  private _sessionApi?: SessionApi;
  private _smsMessageApi?: SMSMessageApi;
  private _userApi?: UserApi;

  constructor({
    apiKey = defaultApiKey,
    serverApiUrl = defaultServerApiUrl,
    apiVersion = defaultApiVersion,
    fetcher,
    libName,
    libVersion,
    packageRepo,
  }: RemoteClerkProps) {
    //   if (!apiKey) {
    //     throw Error(SupportMessages.API_KEY_NOT_FOUND);
    //   }

    this._restClient = new RestClient(
      apiKey,
      serverApiUrl,
      apiVersion,
      fetcher,
      libName,
      libVersion,
      packageRepo
    );
  }

  fetchInterstitial<T>(): Promise<T> {
    return this._restClient.fetchInterstitial<T>();
  }

  // // For use as singleton, always returns the same instance
  // static getInstance(): RemoteClerk {
  //   if (!this._instance) {
  //     this._instance = new RemoteClerk();
  //   }

  //   return this._instance;
  // }

  // Setters for the embedded rest client
  set apiKey(value: string) {
    this._restClient.apiKey = value;
  }

  set serverApiUrl(value: string) {
    this._restClient.serverApiUrl = value;
  }

  set apiVersion(value: string) {
    this._restClient.apiVersion = value;
  }

  // Lazy sub-api getters
  get allowlistIdentifiers(): AllowlistIdentifierApi {
    if (!this._allowlistIdentifierApi) {
      this._allowlistIdentifierApi = new AllowlistIdentifierApi(
        this._restClient
      );
    }
    return this._allowlistIdentifierApi;
  }

  get clients(): ClientApi {
    if (!this._clientApi) {
      this._clientApi = new ClientApi(this._restClient);
    }

    return this._clientApi;
  }

  get emails(): EmailApi {
    if (!this._emailApi) {
      this._emailApi = new EmailApi(this._restClient);
    }

    return this._emailApi;
  }

  get invitations(): InvitationApi {
    if (!this._invitationApi) {
      this._invitationApi = new InvitationApi(this._restClient);
    }
    return this._invitationApi;
  }

  get sessions(): SessionApi {
    if (!this._sessionApi) {
      this._sessionApi = new SessionApi(this._restClient);
    }

    return this._sessionApi;
  }

  get smsMessages(): SMSMessageApi {
    if (!this._smsMessageApi) {
      this._smsMessageApi = new SMSMessageApi(this._restClient);
    }

    return this._smsMessageApi;
  }

  get users(): UserApi {
    if (!this._userApi) {
      this._userApi = new UserApi(this._restClient);
    }

    return this._userApi;
  }
}
