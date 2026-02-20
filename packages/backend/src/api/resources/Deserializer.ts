import {
  ActorToken,
  AgentTask,
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
  M2MToken,
  Machine,
  MachineScope,
  MachineSecretKey,
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
import { BillingPlan } from './CommercePlan';
import { BillingSubscription } from './CommerceSubscription';
import { BillingSubscriptionItem } from './CommerceSubscriptionItem';
import { Feature } from './Feature';
import type { PaginatedResponseJSON } from './JSON';
import { ObjectType } from './JSON';
import { WaitlistEntry } from './WaitlistEntry';

type ResourceResponse<T> = {
  /**
   * An array that contains the fetched data.
   */
  data: T;
};

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * If the promise resolves, you will get back the [properties](#properties) listed below. `data` will be an array of the resource type you requested. You can use the `totalCount` property to determine how many total items exist remotely.
 *
 * Some methods that return this type allow pagination with the `limit` and `offset` parameters, in which case the first 10 items will be returned by default. For methods such as [`getAllowlistIdentifierList()`](https://clerk.com/docs/reference/backend/allowlist/get-allowlist-identifier-list), which do not take a `limit` or `offset`, all items will be returned.
 *
 * If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 *
 * @interface
 */
export type PaginatedResourceResponse<T> = ResourceResponse<T> & {
  /**
   * The total count of data that exist remotely.
   */
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
    case ObjectType.Machine:
      return Machine.fromJSON(item);
    case ObjectType.MachineScope:
      return MachineScope.fromJSON(item);
    case ObjectType.MachineSecretKey:
      return MachineSecretKey.fromJSON(item);
    case ObjectType.M2MToken:
      return M2MToken.fromJSON(item);
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
    case ObjectType.AgentTask:
      return AgentTask.fromJSON(item);
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
    case ObjectType.BillingPlan:
      return BillingPlan.fromJSON(item);
    case ObjectType.BillingSubscription:
      return BillingSubscription.fromJSON(item);
    case ObjectType.BillingSubscriptionItem:
      return BillingSubscriptionItem.fromJSON(item);
    case ObjectType.Feature:
      return Feature.fromJSON(item);
    default:
      return item;
  }
}
