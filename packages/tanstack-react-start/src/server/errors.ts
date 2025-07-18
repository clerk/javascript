export class ClerkHandshakeRedirect extends Error {
  constructor(
    public status: number,
    public headers: Headers,
  ) {
    super('Clerk handshake redirect required');
    this.name = 'ClerkHandshakeRedirect';
    this.status = status;
    this.headers = headers;
  }
}
