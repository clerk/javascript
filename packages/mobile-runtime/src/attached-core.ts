import { authenticationRoots, publicCore, type CoreOwner } from './core.ts';
import { bridgeError, failure, type Invocation, type JSONValue } from './protocol.ts';
import { ResourceRuntime } from './runtime.ts';
import { manifest } from '../../native-bindings/generated/schema.mjs';

/** Projects an existing Clerk owner without starting an engine or installing another client transport. */
export function attachResourceCore(
  clerk: CoreOwner,
  emit: (message: JSONValue) => void,
  options: { namespace?: string } = {},
) {
  if (!clerk.loaded || !clerk.__internal_subscribeNativeResources)
    throw bridgeError('core_not_ready_for_native_resources');
  let ready = false;
  let disposed = false;
  let queued = false;
  const facade = publicCore(clerk);
  const runtime = new ResourceRuntime({
    namespace: options.namespace,
    roots: () => ({
      clerk: facade,
      ...authenticationRoots(clerk),
      session: clerk.session,
      user: clerk.user,
      organization: clerk.organization,
    }),
    emit: message => emit(message as unknown as JSONValue),
  });
  const unsubscribe = clerk.__internal_subscribeNativeResources({
    onState() {
      if (!ready || disposed || queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (disposed) return;
        try {
          runtime.publish();
        } catch (error) {
          emit({ kind: 'runtimeError', failure: failure(error, 'bridge') as unknown as JSONValue });
        }
      });
    },
    onReset(reason) {
      if (reason === 'signOut') runtime.invalidate('Clerk.signOut');
      else runtime.invalidateRoot(reason, reason === 'signIn' ? 'SignIn.reset' : 'SignUp.reset');
    },
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    unsubscribe();
    runtime.dispose();
  }

  function receive(encoded: string) {
    if (disposed) return;
    let message: any;
    try {
      if (encoded.length > 16 * 1024 * 1024) throw bridgeError('message_too_large');
      message = JSON.parse(encoded);
      if (message.kind === 'dispose') {
        dispose();
      } else if (message.kind === 'init') {
        if (ready) throw bridgeError('runtime_already_initialized');
        const configuration = message.configuration;
        if (
          configuration?.contractHash !== manifest.contractHash ||
          configuration?.protocolVersion !== manifest.protocolVersion
        )
          throw bridgeError('incompatible_bindings');
        if (configuration.publishableKey !== clerk.publishableKey) throw bridgeError('core_owner_mismatch');
        const state = runtime.snapshot();
        ready = true;
        emit({ kind: 'ready', id: message.id, manifest, state } as unknown as JSONValue);
      } else if (!ready) {
        throw bridgeError('runtime_not_ready');
      } else if (message.kind === 'invoke') {
        void runtime.invoke(message as Invocation).catch(error => {
          if (!disposed) emit({ kind: 'runtimeError', failure: failure(error, 'bridge') as unknown as JSONValue });
        });
      } else if (message.kind === 'cancel') {
        runtime.cancel(message.id);
      } else if (message.kind === 'release') {
        runtime.release(message.target);
      } else if (message.kind === 'lifecycle' && ['foreground', 'background'].includes(message.state)) {
        // The existing Expo owner controls foreground recovery and token scheduling.
        runtime.publish();
      } else {
        throw bridgeError('unknown_message');
      }
    } catch (error) {
      emit({
        kind: message?.kind === 'init' ? 'initializationFailed' : 'runtimeError',
        ...(message?.kind === 'init' ? { id: message.id } : {}),
        failure: failure(error, 'bridge') as unknown as JSONValue,
      });
    }
  }

  return { receive, dispose };
}
