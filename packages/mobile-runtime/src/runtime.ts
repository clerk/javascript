import { operations } from '../../native-bindings/generated/operations.mjs';
import { roots as rootSchema, schema, manifest } from '../../native-bindings/generated/schema.mjs';
import { decode, encode, type ResourceCodec } from './codec.ts';
import {
  bridgeError,
  failure,
  type Completion,
  type Handle,
  type Invocation,
  type JSONValue,
  type State,
} from './protocol.ts';

type Entry = { handle: Handle; value: any; parent?: string; edge?: string; active: boolean };
type Pending = { epoch: number; cancelled: boolean; target: string; operation: string; completed?: boolean };
type RuntimeOptions = {
  roots: () => Record<string, object | null | undefined>;
  emit: (message: Completion | { kind: 'state'; state: State }) => void;
  beforeInvoke?: (operation: string) => void | Promise<void>;
};

export class ResourceRuntime implements ResourceCodec {
  readonly manifest = manifest;
  #entries = new Map<string, Entry>();
  #identity = new WeakMap<object, Map<string, Entry>>();
  #rootEntries = new Map<string, Entry>();
  #pending = new Map<string, Pending>();
  #sequence = 0;
  #revision = 0;
  #epoch = 0;
  #disposed = false;
  #projectionParent?: string;
  #projectionEdge?: string;
  #invalidated: Handle[] = [];
  #options: RuntimeOptions;

  constructor(options: RuntimeOptions) {
    this.#options = options;
  }

  get epoch(): number {
    return this.#epoch;
  }

  reference(value: object, type: string): Handle {
    if (!value || typeof value !== 'object') throw bridgeError('invalid_resource');
    let entry = this.#identity.get(value)?.get(type);
    if (entry?.active) return entry.handle;
    const serverID = (value as { id?: string }).id;
    entry = Array.from(this.#entries.values()).find(
      candidate =>
        candidate.active &&
        candidate.handle.type === type &&
        ((serverID && candidate.value.id === serverID) ||
          (!serverID &&
            !candidate.value.id &&
            this.#projectionParent &&
            this.#projectionEdge &&
            candidate.parent === this.#projectionParent &&
            candidate.edge === this.#projectionEdge)),
    );
    if (entry) this.#bind(entry, value);
    else {
      entry = {
        handle: { id: `r${++this.#sequence}`, generation: this.#epoch, type },
        value,
        active: true,
        parent: this.#projectionParent,
        edge: this.#projectionEdge,
      };
      this.#entries.set(entry.handle.id, entry);
      this.#bind(entry, value);
    }
    return entry.handle;
  }

  #bind(entry: Entry, value: object): void {
    entry.value = value;
    let identities = this.#identity.get(value);
    if (!identities) this.#identity.set(value, (identities = new Map()));
    identities.set(entry.handle.type, entry);
  }

  resolve(handle: Handle, type: string): object {
    const entry = this.#entries.get(handle.id);
    if (
      this.#disposed ||
      !entry?.active ||
      entry.handle.generation !== handle.generation ||
      entry.handle.type !== type ||
      handle.type !== type
    ) {
      throw bridgeError('stale_resource');
    }
    return entry.value;
  }

  #invalidate(entry: Entry, descendants = true): void {
    if (!entry.active) return;
    entry.active = false;
    this.#invalidated.push(entry.handle);
    if (descendants)
      for (const child of this.#entries.values()) if (child.parent === entry.handle.id) this.#invalidate(child);
    this.#entries.delete(entry.handle.id);
  }

  invalidate(preserveOperation?: string): void {
    this.#epoch++;
    for (const entry of this.#entries.values()) if (entry.handle.type !== 'Clerk') this.#invalidate(entry);
    for (const pending of this.#pending.values())
      if (pending.operation === preserveOperation) pending.epoch = this.#epoch;
    this.#rootEntries.clear();
  }

  release(handle: Handle): void {
    const entry = this.#entries.get(handle.id);
    if (entry?.handle.generation === handle.generation && !Array.from(this.#rootEntries.values()).includes(entry)) {
      if (Array.from(this.#pending.values()).some(p => p.target === handle.id)) return;
      this.#invalidate(entry, false);
    }
  }

  snapshot(settledTarget?: string): State {
    if (this.#disposed) throw bridgeError('runtime_disposed');
    this.#projectionParent = undefined;
    this.#projectionEdge = undefined;
    const roots: Record<string, Handle | null> = {};
    const currentRoots = this.#options.roots();
    for (const [key, descriptor] of Object.entries(rootSchema) as [string, { name: string }][]) {
      const value: any = currentRoots[key];
      let previous = this.#rootEntries.get(key);
      const busy =
        previous &&
        previous.handle.id !== settledTarget &&
        Array.from(this.#pending.values()).some(p => p.target === previous?.handle.id);
      if (previous?.active && busy && previous.value !== value) {
        roots[key] = previous.handle;
        continue;
      }
      if (previous?.active && previous.value !== value) {
        if (value?.id && previous.value.id === value.id) this.#bind(previous, value);
        else {
          this.#invalidate(previous);
          previous = undefined;
        }
      }
      if (!value) {
        roots[key] = null;
        this.#rootEntries.delete(key);
        continue;
      }
      const handle = previous?.active ? previous.handle : this.reference(value, descriptor.name);
      this.#rootEntries.set(key, this.#entries.get(handle.id)!);
      roots[key] = handle;
    }
    const resources: State['resources'] = [];
    for (const entry of this.#entries.values()) {
      if (!entry.active) continue;
      const state: Record<string, JSONValue> = {};
      const definition = schema[entry.handle.type];
      for (const property of definition.properties) {
        const value = entry.value[property.name];
        if (value === undefined && property.optional) continue;
        this.#projectionParent = entry.handle.id;
        this.#projectionEdge = value && typeof value === 'object' && !Array.isArray(value) ? property.name : undefined;
        try {
          state[property.name] = encode(property.type, value, this);
        } catch {
          throw bridgeError(`invalid_projection:${entry.handle.type}.${property.name}`);
        }
      }
      resources.push({ handle: entry.handle, state });
    }
    this.#projectionParent = undefined;
    this.#projectionEdge = undefined;
    const invalidated = this.#invalidated.splice(0);
    return { epoch: this.#epoch, revision: ++this.#revision, roots, resources, invalidated };
  }

  publish(): void {
    if (!this.#disposed) this.#options.emit({ kind: 'state', state: this.snapshot() });
  }

  async invoke(call: Invocation): Promise<void> {
    if (this.#disposed) return;
    if (this.#pending.has(call.id)) throw bridgeError('duplicate_call');
    const pending: Pending = {
      epoch: this.#epoch,
      cancelled: false,
      target: call.target.id,
      operation: call.operation,
    };
    this.#pending.set(call.id, pending);
    let result: JSONValue | undefined;
    let error: Completion['failure'];
    try {
      const operation = Object.hasOwn(operations, call.operation) ? operations[call.operation] : undefined;
      if (!operation) throw bridgeError('unknown_operation');
      this.resolve(call.target, operation.type);
      if (!Array.isArray(call.args) || call.args.length > operation.parameters.length)
        throw bridgeError('invalid_arguments');
      const args = operation.parameters.map((parameter: any, index: number) => {
        if (index >= call.args.length && parameter.optional) return undefined;
        return decode(parameter.type, call.args[index], this);
      });
      await this.#options.beforeInvoke?.(call.operation);
      const target = this.resolve(call.target, operation.type);
      const output = await operation.invoke(target, args);
      if (operation.result.kind === 'errorResult') {
        if (!output || typeof output !== 'object' || !('error' in output)) throw bridgeError('invalid_error_result');
        result = { error: output.error === null ? null : (failure(output.error, 'clerk') as unknown as JSONValue) };
      } else {
        result = encode(operation.result, output, this);
      }
    } catch (cause) {
      error = failure(cause);
    } finally {
      this.#pending.delete(call.id);
      if (this.#disposed) return;
      if (pending.epoch !== this.#epoch) {
        result = undefined;
        error = failure(bridgeError('stale_operation'), 'bridge');
      }
      if (pending.cancelled) {
        result = undefined;
        error = failure(bridgeError('caller_cancelled'), 'cancelled');
      }
      const state = this.snapshot(call.target.id);
      if (pending.completed) this.#options.emit({ kind: 'state', state });
      else
        this.#options.emit({
          kind: 'complete',
          id: call.id,
          state,
          ...(result !== undefined ? { result } : {}),
          ...(error ? { failure: error } : {}),
        });
    }
  }

  cancel(id: string): void {
    const pending = this.#pending.get(id);
    if (!pending || pending.completed) return;
    pending.cancelled = true;
    pending.completed = true;
    this.#options.emit({
      kind: 'complete',
      id,
      state: this.snapshot(),
      failure: failure(bridgeError('caller_cancelled'), 'cancelled'),
    });
  }
  dispose(): void {
    this.#disposed = true;
    this.#pending.clear();
    this.#entries.clear();
    this.#rootEntries.clear();
  }
}
