const MAX_BURST = 20;
const REFILL_RATE = 10; // tokens per second
const MAX_BUCKETS = 10_000;

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

export function checkMachineTokenRateLimit(ip: string): boolean {
  if (buckets.size >= MAX_BUCKETS) {
    buckets.clear();
  }
  const now = Date.now();
  const existing = buckets.get(ip);
  const bucket: Bucket = existing ?? { tokens: MAX_BURST, lastRefill: now };
  const elapsed = (now - bucket.lastRefill) / 1000;
  const refilled = Math.min(MAX_BURST, bucket.tokens + elapsed * REFILL_RATE);
  if (refilled < 1) {
    buckets.set(ip, { tokens: refilled, lastRefill: now });
    return false;
  }
  buckets.set(ip, { tokens: refilled - 1, lastRefill: now });
  return true;
}

export function resetMachineTokenRateLimiter(): void {
  buckets.clear();
}
