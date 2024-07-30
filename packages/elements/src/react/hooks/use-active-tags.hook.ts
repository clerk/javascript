import { useSelector } from '@xstate/react';
import type { ActorRef, AnyActorRef, AnyMachineSnapshot, MachineSnapshot } from 'xstate';

type TaggedActor<TActor extends AnyActorRef> =
  TActor extends ActorRef<MachineSnapshot<any, any, any, any, infer TTags, any, any>, any> ? TTags : never;

export const ActiveTagsMode = {
  any: 'any',
  all: 'all',
} as const;

export type UseActiveTagsMode = (typeof ActiveTagsMode)[keyof typeof ActiveTagsMode];
export type UseActiveTagsSingleReturn = boolean;
export type UseActiveTagsMultiAnyReturn<TTag> = { active: boolean; activeTags: Set<TTag> };
export type UseActiveTagsReturn<TTag> = UseActiveTagsSingleReturn | UseActiveTagsMultiAnyReturn<TTag>;

/**
 * Generic hook to check if a tag is active.
 *
 * @example
 * const ref = SignUpCtx.useActorRef();
 *
 * useActiveTags(ref, 'external');
 * useActiveTags(ref, ['external', 'email_code']);
 * useActiveTags(ref, ['external', 'email_code'], 'all');
 *
 * @param actor {ActorRef} Machine actor reference
 * @param tag {(string | string[])} The tag(s) to check
 * @param mode {UseActiveTagsMode} Whether to match all tags or any tag
 *
 * @returns {(boolean|UseActiveTagsReturn)} Whether the tag(s) are active
 */
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tag: TTag,
): boolean;
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tags: TTag[],
  mode: 'all',
): boolean;
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tags: TTag[],
  mode?: 'any',
): UseActiveTagsMultiAnyReturn<TTag>;
export function useActiveTags<TActor extends AnyActorRef, TTag extends TaggedActor<TActor>>(
  actor: TActor,
  tags: TTag | TTag[],
  mode: UseActiveTagsMode = ActiveTagsMode.any,
): UseActiveTagsReturn<TTag> {
  const state = useSelector<TActor, AnyMachineSnapshot>(
    actor,
    s => s,
    (prev, next) => prev.tags === next.tags,
  );

  if (!state) {
    return false;
  }

  if (typeof tags === 'string') {
    return state.hasTag(tags);
  }

  if (!Array.isArray(tags)) {
    throw new Error('Invalid tags parameter provided to useActiveTags');
  }

  switch (mode) {
    case ActiveTagsMode.any: {
      const matching = new Set(tags.filter(tag => state.hasTag(tag)));
      return { active: matching.size > 0, activeTags: matching };
    }
    case ActiveTagsMode.all:
      return tags.length === state.tags.size ? tags.every(tag => state.hasTag(tag)) : false;
    default:
      return false;
  }
}
