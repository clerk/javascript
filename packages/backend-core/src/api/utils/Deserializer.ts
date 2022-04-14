import {
  AllowlistIdentifier,
  Client,
  Email,
  Invitation,
  Organization,
  Session,
  SMSMessage,
  Token,
  User,
} from '../resources';
import { ObjectType } from '../resources/JSON';
import Logger from './Logger';

// FIXME don't return any
export default function deserialize(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => jsonToObject(item));
  } else {
    return jsonToObject(data);
  }
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
