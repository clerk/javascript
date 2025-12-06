export { ClerkProvider } from './client-boundary/ClerkProvider';
export { Show, SignedIn, SignedOut } from './client-boundary/controlComponents';

/**
 * `<Protect>` is only available as a React Server Component in the App Router.
 * For client-side conditional rendering, use `<Show when={...} />` instead.
 *
 * @example
 * ```tsx
 * // Server Component (App Router)
 * <Protect permission="org:read">...</Protect>
 *
 * // Client Component
 * <Show when={{ permission: "org:read" }}>...</Show>
 * ```
 */
export const Protect = () => {
  throw new Error(
    '`<Protect>` is only available as a React Server Component. For client components, use `<Show when={...} />` instead.',
  );
};
