import type { HookDoc } from '../docs-schema';
import type { useListRemovalFocus } from './use-list-removal-focus';

export default {
  name: 'useListRemovalFocus',
  description:
    "Moves focus after a list row is removed: to the trigger of the row that took the removed row's place, or the previous one at the end of the list, or `fallback()` when the list is empty.",
  useFor: [
    'moving focus after a list row is removed',
    'restoring focus from a remove dialog to the next row instead of the page body',
  ],
  keywords: ['focus', 'remove', 'delete', 'list', 'row', 'final focus', 'accessibility'],
  practices: [
    { do: true, text: 'Pass `finalFocus` to the remove dialog so focus lands on the next row when it closes.' },
    { do: true, text: 'Attach `registerTrigger(id)` as the ref of the button that opens each row’s actions.' },
    { do: false, text: 'Keep your own ref map of row buttons to restore focus. Use this hook instead.' },
  ],
  options: {
    ids: { type: 'string[]', doc: 'The row ids in rendered order, before the removal.' },
    onRemove: {
      type: '(id: string) => void | Promise<void>',
      doc: 'Removes the row. When unset, `remove` does nothing.',
    },
    fallback: {
      type: '() => HTMLElement | null',
      doc: 'The element to focus when no row is left, such as the add button.',
    },
  },
  returns: {
    registerTrigger: {
      type: '(id: string) => (element: HTMLButtonElement | null) => void',
      doc: 'Returns a callback ref that records the trigger button for `id`.',
    },
    trigger: { type: '(id: string) => HTMLButtonElement | null', doc: 'The registered trigger for `id`, or `null`.' },
    remove: {
      type: '(id: string) => Promise<void>',
      doc: 'Awaits `onRemove(id)`, then remembers the row so `finalFocus` can pick its successor. Remembers nothing if `onRemove` rejects.',
    },
    finalFocus: {
      type: '() => HTMLElement | null',
      doc: 'Returns the element to focus after a removal and forgets it, or `null` when nothing was removed.',
    },
  },
  related: ['useConfirmController', 'usePendingAction'],
} satisfies HookDoc<Parameters<typeof useListRemovalFocus>[0], ReturnType<typeof useListRemovalFocus>>;
