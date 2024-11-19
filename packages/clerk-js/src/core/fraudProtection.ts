/**
 * TODO: @nikos Move captcha and fraud detection logic to this class
 */
class FraudProtectionService {
  private inflightRequest: Promise<unknown> | null = null;

  public async execute<T extends () => Promise<any>>(cb: T): Promise<Awaited<ReturnType<T>>> {
    if (this.inflightRequest) {
      await this.inflightRequest;
    }

    const prom = cb();
    this.inflightRequest = prom;
    return prom.then(res => {
      this.inflightRequest = null;
      return res;
    });
  }

  public blockUntilReady() {
    return this.inflightRequest ? this.inflightRequest.then(() => null) : Promise.resolve();
  }
}

export const fraudProtection = new FraudProtectionService();
