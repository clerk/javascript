import { computed, type ComputedRef } from 'vue';

export type ToComputedRefs<T = any> = {
  [K in keyof T]: ComputedRef<T[K]>;
};

/**
 * Converts a computed ref to an object of computed refs.
 * This will allow the composables to be destructurable and still maintain reactivity.
 */
export function toComputedRefs<T extends object>(objectRef: ComputedRef<T>): ToComputedRefs<T> {
  const result = {} as any;

  for (const key in objectRef.value) {
    result[key] = computed(() => objectRef.value[key]);
  }

  return result;
}
