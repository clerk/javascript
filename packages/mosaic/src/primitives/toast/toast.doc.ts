import type { ComponentDoc } from '../../docs-schema';
import type { ToastActionProps } from './toast-action';
import type { ToastArrowProps } from './toast-arrow';
import type { ToastCloseProps } from './toast-close';
import type { ToastContentProps } from './toast-content';
import type { ToastDescriptionProps } from './toast-description';
import type { ToastPortalProps } from './toast-portal';
import type { ToastPositionerProps } from './toast-positioner';
import type { ToastProviderProps } from './toast-provider';
import type { ToastRootProps } from './toast-root';
import type { ToastTitleProps } from './toast-title';
import type { ToastViewportProps } from './toast-viewport';

export default {
  name: 'Toast',
  description:
    'Headless, unstyled notifications stacked in a viewport. Add them with `Toast.useToastManager()`, or a `Toast.createToastManager()` instance outside React. They auto-dismiss on a timer that pauses while the viewport is hovered or focused, the window is blurred or the tab is hidden, queue beyond a limit, and announce themselves to screen readers. `F6` moves focus to the newest toast and back.',
  useFor: [
    'feedback for an action that has no surface of its own, such as a save after its form closed',
    'a loading, then success or error, notice for a promise',
    'a short confirmation beside the element that caused it, such as Copied',
    'showing a notification from outside React',
  ],
  keywords: ['toast', 'notification', 'snackbar', 'alert', 'announce', 'live region', 'flash message'],
  practices: [
    {
      do: true,
      text: 'Render every toast from `useToastManager().toasts`, and filter anchored ones with `Toast.isAnchored` into a `Toast.Positioner`.',
    },
    { do: true, text: 'Hide `data-limited` toasts with CSS. They stay in the list, inert, while queued.' },
    {
      do: true,
      text: 'Use `manager.promise()` for an async action instead of adding and updating toasts by hand. It rethrows a rejection after showing the error toast, so catch it.',
    },
    {
      do: true,
      text: 'Pass the same `id` to `add` to refresh an open toast. It bumps `repeatCount` and sets `data-repeated`.',
    },
    {
      do: false,
      text: 'Use a toast for something the user must answer. Use `Dialog`, or `useConfirmController` for a confirm step.',
    },
    { do: false, text: 'Render `Toast.Arrow` outside `Toast.Positioner`. It throws.' },
  ],
  parts: {
    'Toast.Provider': {
      description: 'Owns the toast list, timers and queue. Renders no element.',
      props: {
        timeout: { type: 'number', doc: 'Auto-dismiss delay in ms. `0` keeps toasts until closed.', default: '5000' },
        limit: {
          type: 'number',
          doc: 'Most stacked toasts shown at once. Older ones beyond it are marked `limited`.',
          default: '3',
        },
        toastManager: {
          type: 'ExternalToastManager',
          doc: 'A manager from `createToastManager()`, for adding toasts outside React.',
        },
      },
    },
    'Toast.Portal': {
      description: 'Portals its children.',
      props: {
        root: {
          type: 'HTMLElement | null | RefObject<HTMLElement | null>',
          doc: 'The element to portal into.',
          default: 'the `Portal` container',
        },
      },
    },
    'Toast.Viewport': {
      description:
        'A `div` with `role="region"` and `aria-label="Notifications"` that holds the stack. Hover or focus inside pauses every timer. Carries `data-expanded` and `--toast-frontmost-height`.',
    },
    'Toast.Positioner': {
      description:
        'Places one toast against an anchor element, outside the stack and the limit. Carries `data-side`, `data-align`, `data-anchor-hidden` and the anchor CSS variables. Fields in `toast.positionerProps` override its props.',
      props: {
        toast: { type: 'ToastObject', doc: 'The toast from `useToastManager().toasts`.' },
        anchor: { type: 'Element | null', doc: 'The element to sit next to.', default: 'null' },
        side: { type: 'ToastSide', doc: 'The side of the anchor. Flips when there is no room.', default: "'top'" },
        align: { type: 'ToastAlign', doc: 'Alignment along that side.', default: "'center'" },
        sideOffset: { type: 'number', doc: 'Gap to the anchor in px.', default: '0' },
        alignOffset: { type: 'number', doc: 'Shift along the alignment axis in px.', default: '0' },
      },
    },
    'Toast.Root': {
      description:
        'One toast: a focusable `div` with `role="dialog"`, labelled by its title and described by its description. `Escape` closes it. Carries `data-type`, `data-expanded`, `data-limited`, `data-repeated`, `data-starting-style` and `data-ending-style`, and `--toast-index`, `--toast-offset-y`, `--toast-height` and `--toast-frontmost-height`.',
      props: { toast: { type: 'ToastObject', doc: 'The toast from `useToastManager().toasts`.' } },
    },
    'Toast.Arrow': {
      description: 'A `FloatingArrow` `svg` pointing at the anchor, inside `Toast.Positioner`. Carries `data-side`.',
    },
    'Toast.Content': {
      description: 'A layout `div`. Carries `data-behind` on toasts behind the frontmost, and `data-expanded`.',
    },
    'Toast.Title': {
      description: 'An `h2` that labels the toast. Renders nothing without content.',
      props: { children: { type: 'React.ReactNode', doc: 'The title.', default: 'toast.title' } },
    },
    'Toast.Description': {
      description: 'A `p` that describes the toast. Renders nothing without content.',
      props: { children: { type: 'React.ReactNode', doc: 'The description.', default: 'toast.description' } },
    },
    'Toast.Action': {
      description:
        'A `button` that merges `toast.actionProps`, runs its `onClick`, then closes the toast. Renders nothing without action props, children or `render`.',
    },
    'Toast.Close': { description: 'A `button` that closes the toast.' },
  },
  examples: [
    {
      title: 'Stacked toasts',
      code: `
function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map(toast => (
    <Toast.Root key={toast.id} toast={toast}>
      <Toast.Content>
        <Toast.Title />
        <Toast.Description />
      </Toast.Content>
      <Toast.Action />
      <Toast.Close aria-label='Close' />
    </Toast.Root>
  ));
}

<Toast.Provider>
  <App />
  <Toast.Portal>
    <Toast.Viewport>
      <ToastList />
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>
`,
    },
    {
      title: 'Promise',
      code: `
const manager = Toast.useToastManager();
manager
  .promise(saveProfile(), {
    loading: 'Saving…',
    success: 'Profile saved',
    error: 'Could not save',
  })
  .catch(() => {});
`,
    },
  ],
  related: ['Portal', 'Dialog'],
} satisfies ComponentDoc<{
  'Toast.Provider': ToastProviderProps;
  'Toast.Portal': ToastPortalProps;
  'Toast.Viewport': ToastViewportProps;
  'Toast.Positioner': ToastPositionerProps;
  'Toast.Root': ToastRootProps;
  'Toast.Arrow': ToastArrowProps;
  'Toast.Content': ToastContentProps;
  'Toast.Title': ToastTitleProps;
  'Toast.Description': ToastDescriptionProps;
  'Toast.Action': ToastActionProps;
  'Toast.Close': ToastCloseProps;
}>;
