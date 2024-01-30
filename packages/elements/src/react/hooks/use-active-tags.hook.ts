import { useSelector } from '@xstate/react';
import type { ActorRef, AnyActorRef, AnyMachineSnapshot, MachineSnapshot } from 'xstate';

type TaggedActor<TActor extends AnyActorRef> = TActor extends ActorRef<
  MachineSnapshot<any, any, any, any, infer TTags, any>,
  any
>
  ? TTags
  : never;

/**
 * Generic hook to check if a tag is active.
 *
 * @example
 * const ref = useSignUpFlow();
 *
 * useActiveTags(ref, 'external');
 * useActiveTags(ref, ['external', 'email_code']);
 *
 * @param actor {ActorRef} Machine actor reference
 * @param tag {string | string[]} The tag(s) to check
 * @param exact {boolean} Whether to match all tags or any tag
 *
 * @returns {boolean}
 */
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tag: TTag,
): boolean;
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tags: TTag[],
  exact?: boolean,
): boolean;
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tags: TTag | TTag[],
  exact?: boolean,
): boolean {
  const currentState = useSelector<TActor, AnyMachineSnapshot>(
    actor,
    s => s,
    (prev, next) => prev.tags === next.tags,
  );

  if (typeof tags === 'string') {
    return currentState.hasTag(tags);
  }

  if (Array.isArray(tags)) {
    return exact ? tags.every(tag => currentState.hasTag(tag)) : tags.some(tag => currentState.hasTag(tag));
  }

  return false;
}
