export class JWTExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTExpiredError';
  }
}

export class MissingJWTVerificationKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingJWTVerificationKeyError';
  }
}
