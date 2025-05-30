import {
  ActorToken,
  AllowlistIdentifier,
  APIKey,
  BlocklistIdentifier,
  Client,
  Cookies,
  DeletedObject,
  Domain,
  Email,
  EmailAddress,
  IdPOAuthAccessToken,
  Instance,
  InstanceRestrictions,
  InstanceSettings,
  Invitation,
  JwtTemplate,
  MachineToken,
  OauthAccessToken,
  OAuthApplication,
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationSettings,
  PhoneNumber,
  ProxyCheck,
  RedirectUrl,
  SamlConnection,
  Session,
  SignInToken,
  SignUpAttempt,
  SMSMessage,
  Token,
  User,
} from '.';
import { AccountlessApplication } from './AccountlessApplication';
import type { PaginatedResponseJSON } from './JSON';
import { ObjectType } from './JSON';
import { WaitlistEntry } from './WaitlistEntry';

type ResourceResponse<T> = {
  data: T;
};

export type PaginatedResourceResponse<T> = ResourceResponse<T> & {
  totalCount: number;
};

export function deserialize<U = any>(payload: unknown): PaginatedResourceResponse<U> | ResourceResponse<U> {
  let data, totalCount: number | undefined;

  if (Array.isArray(payload)) {
    const data = payload.map(item => jsonToObject(item)) as U;
    return { data };
  } else if (isPaginated(payload)) {
    data = payload.data.map(item => jsonToObject(item)) as U;
    totalCount = payload.total_count;

    return { data, totalCount };
  } else {
    return { data: jsonToObject(payload) };
  }
}

function isPaginated(payload: unknown): payload is PaginatedResponseJSON {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return false;
  }

  return Array.isArray(payload.data) && payload.data !== undefined;
}

function getCount(item: PaginatedResponseJSON) {
  return item.total_count;
}

// TODO: Revise response deserialization
function jsonToObject(item: any): any {
  // Special case: DeletedObject
  // TODO: Improve this check
  if (typeof item !== 'string' && 'object' in item && 'deleted' in item) {
    return DeletedObject.fromJSON(item);
  }

  switch (item.object) {
    case ObjectType.AccountlessApplication:
      return AccountlessApplication.fromJSON(item);
    case ObjectType.ActorToken:
      return ActorToken.fromJSON(item);
    case ObjectType.AllowlistIdentifier:
      return AllowlistIdentifier.fromJSON(item);
    case ObjectType.ApiKey:
      return APIKey.fromJSON(item);
    case ObjectType.BlocklistIdentifier:
      return BlocklistIdentifier.fromJSON(item);
    case ObjectType.Client:
      return Client.fromJSON(item);
    case ObjectType.Cookies:
      return Cookies.fromJSON(item);
    case ObjectType.Domain:
      return Domain.fromJSON(item);
    case ObjectType.EmailAddress:
      return EmailAddress.fromJSON(item);
    case ObjectType.Email:
      return Email.fromJSON(item);
    case ObjectType.IdpOAuthAccessToken:
      return IdPOAuthAccessToken.fromJSON(item);
    case ObjectType.Instance:
      return Instance.fromJSON(item);
    case ObjectType.InstanceRestrictions:
      return InstanceRestrictions.fromJSON(item);
    case ObjectType.InstanceSettings:
      return InstanceSettings.fromJSON(item);
    case ObjectType.Invitation:
      return Invitation.fromJSON(item);
    case ObjectType.JwtTemplate:
      return JwtTemplate.fromJSON(item);
    case ObjectType.MachineToken:
      return MachineToken.fromJSON(item);
    case ObjectType.OauthAccessToken:
      return OauthAccessToken.fromJSON(item);
    case ObjectType.OAuthApplication:
      return OAuthApplication.fromJSON(item);
    case ObjectType.Organization:
      return Organization.fromJSON(item);
    case ObjectType.OrganizationInvitation:
      return OrganizationInvitation.fromJSON(item);
    case ObjectType.OrganizationMembership:
      return OrganizationMembership.fromJSON(item);
    case ObjectType.OrganizationSettings:
      return OrganizationSettings.fromJSON(item);
    case ObjectType.PhoneNumber:
      return PhoneNumber.fromJSON(item);
    case ObjectType.ProxyCheck:
      return ProxyCheck.fromJSON(item);
    case ObjectType.RedirectUrl:
      return RedirectUrl.fromJSON(item);
    case ObjectType.SamlConnection:
      return SamlConnection.fromJSON(item);
    case ObjectType.SignInToken:
      return SignInToken.fromJSON(item);
    case ObjectType.SignUpAttempt:
      return SignUpAttempt.fromJSON(item);
    case ObjectType.Session:
      return Session.fromJSON(item);
    case ObjectType.SmsMessage:
      return SMSMessage.fromJSON(item);
    case ObjectType.Token:
      return Token.fromJSON(item);
    case ObjectType.TotalCount:
      return getCount(item);
    case ObjectType.User:
      return User.fromJSON(item);
    case ObjectType.WaitlistEntry:
      return WaitlistEntry.fromJSON(item);
    default:
      return item;
  }
}
