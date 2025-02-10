import {
  AllowlistIdentifier,
  Client,
  Cookies,
  DeletedObject,
  Email,
  EmailAddress,
  Invitation,
  OauthAccessToken,
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  PhoneNumber,
  RedirectUrl,
  Session,
  SignInToken,
  SMSMessage,
  Token,
  User,
} from '.';
import { AccountlessApplication } from './AccountlessApplication';
import type { PaginatedResponseJSON } from './JSON';
import { ObjectType } from './JSON';

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
    case ObjectType.AllowlistIdentifier:
      return AllowlistIdentifier.fromJSON(item);
    case ObjectType.Client:
      return Client.fromJSON(item);
    case ObjectType.Cookies:
      return Cookies.fromJSON(item);
    case ObjectType.EmailAddress:
      return EmailAddress.fromJSON(item);
    case ObjectType.Email:
      return Email.fromJSON(item);
    case ObjectType.Invitation:
      return Invitation.fromJSON(item);
    case ObjectType.OauthAccessToken:
      return OauthAccessToken.fromJSON(item);
    case ObjectType.Organization:
      return Organization.fromJSON(item);
    case ObjectType.OrganizationInvitation:
      return OrganizationInvitation.fromJSON(item);
    case ObjectType.OrganizationMembership:
      return OrganizationMembership.fromJSON(item);
    case ObjectType.PhoneNumber:
      return PhoneNumber.fromJSON(item);
    case ObjectType.RedirectUrl:
      return RedirectUrl.fromJSON(item);
    case ObjectType.SignInToken:
      return SignInToken.fromJSON(item);
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
    default:
      return item;
  }
}
