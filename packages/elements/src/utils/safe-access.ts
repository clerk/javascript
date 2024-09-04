export function safeAccess(fn: any, fallback: any) {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
}
