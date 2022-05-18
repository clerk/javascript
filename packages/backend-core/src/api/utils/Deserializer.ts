import {
  AllowlistIdentifier,
  Client,
  Email,
  Invitation,
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  Session,
  SMSMessage,
  Token,
  User,
} from '../resources';
import { ObjectType } from '../resources/JSON';
import Logger from './Logger';

// FIXME don't return any
export default function deserialize(payload: any): any {
  if (Array.isArray(payload)) {
    return payload.map(item => jsonToObject(item));
  } else if (isPaginated(payload)) {
    return payload.data.map(item => jsonToObject(item));
  } else {
    return jsonToObject(payload);
  }
}

type PaginatedResponse = {
  data: Array<object>;
};

function isPaginated(payload: any): payload is PaginatedResponse {
  return <PaginatedResponse>payload.data !== undefined;
}

function getCount(item: { total_count: number }) {
  return item.total_count;
}

// TODO: Revise response deserialization
function jsonToObject(item: any): any {
  switch (item.object) {
    case ObjectType.AllowlistIdentifier:
      return AllowlistIdentifier.fromJSON(item);
    case ObjectType.Client:
      return Client.fromJSON(item);
    case ObjectType.Email:
      return Email.fromJSON(item);
    case ObjectType.Invitation:
      return Invitation.fromJSON(item);
    case ObjectType.Organization:
      return Organization.fromJSON(item);
    case ObjectType.OrganizationInvitation:
      return OrganizationInvitation.fromJSON(item);
    case ObjectType.OrganizationMembership:
      return OrganizationMembership.fromJSON(item);
    case ObjectType.User:
      return User.fromJSON(item);
    case ObjectType.Session:
      return Session.fromJSON(item);
    case ObjectType.SmsMessage:
      return SMSMessage.fromJSON(item);
    case ObjectType.Token:
      return Token.fromJSON(item);
    case ObjectType.TotalCount:
      return getCount(item);
    default:
      Logger.error(`Unexpected object type: ${item.object}`);
  }
}
