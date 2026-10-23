export type FromPayload<Payload, Value> = Value | ((payload: Payload) => Value);

function isFromPayload<Payload, Value>(value: FromPayload<Payload, Value>): value is (payload: Payload) => Value {
  return typeof value === 'function';
}

export function resolveFromPayload<Payload, Value>(value: FromPayload<Payload, Value>, payload: Payload): Value {
  return isFromPayload(value) ? value(payload) : value;
}
