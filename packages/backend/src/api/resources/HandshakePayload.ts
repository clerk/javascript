export type HandshakePayloadJSON = {
  nonce: string;
  payload: string;
};

export class HandshakePayload {
  constructor(
    readonly nonce: string,
    readonly payload: string,
  ) {}

  static fromJSON(data: HandshakePayloadJSON): HandshakePayload {
    return new HandshakePayload(data.nonce, data.payload);
  }
}
