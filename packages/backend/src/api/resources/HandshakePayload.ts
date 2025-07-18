export type HandshakePayloadJSON = {
  directives: string[];
};

export class HandshakePayload {
  constructor(readonly directives: string[]) {}

  static fromJSON(data: HandshakePayloadJSON): HandshakePayload {
    return new HandshakePayload(data.directives);
  }
}
