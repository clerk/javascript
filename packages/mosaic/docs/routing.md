# Routing

How a Mosaic component owns a segment of the page's location, and how a host or a modal moves it there. The reasons behind the shape are in the [decision records](edrs/README.md); read them before changing anything under `src/routing`.

## The model

A component owns one segment of the location under a base. `/user` is the user profile's default base, so its Security page is the segment `security` under `/user`. Which page is open is the location's to say, never the component's: the component reads its segment, derives a route from it, and navigates by writing a new segment. It holds no routing state of its own.

Where the segment lives is the component's `routing`: `virtual` keeps it in memory in `MosaicProvider`, keyed by base, and the browser URL does not change; `path`, `hash` and `query` keep it in the page's URL. The same component code runs in every mode; only the location differs.

In virtual mode a segment lives while a mounted component owns it. Navigate away and it is gone; come back and the component starts on its root. A component that React parks without unmounting, as `Activity` does, keeps its segment and resumes where it was. Virtual mode has no history: Back does not restore a segment the way the URL modes do. In a URL mode the segment lives as long as the URL has it, and nothing is parked.

## URL modes

- `path` keeps the segment in the pathname under `path`, `/user/security`, as the legacy components do. `path` is where the component is mounted, so a host with a catch-all route at `/account/[[...page]]` passes `path='/account'`. A component mounted somewhere else shows its first page and warns in development. One component per page can use the pathname.
- `hash` and `query` keep the segment in one param per component, `#user=security` or `?p.user=security`. The param's name is a prefix and the component's base with dots for slashes, so the profile modal at `/modal/user` is `p.modal.user`. The default prefixes are `p.` for the query string and nothing for the hash; set them on the provider with `routing={{ keyPrefix: { query: 'app.', hash: 'x.' } }}`. The value is the segment's parts, each percent-encoded, joined with `/`, and is read back the way the host reads any param, decoded, so a part cannot contain a slash in these modes. Other params are left exactly as they are.
- A navigation pushes a history entry; a redirect to the root and a modal closing replace. Back moves through a component's pages. Reloading or sharing the URL opens the page it names.
- `routing` is fixed when the component mounts. To change it, remount the component with a `key`; a changed prop warns and is ignored.
- Without an adapter the URL modes read and write `window.location`. The server renders the component's first page and the client corrects it after hydration.

### The host router

Hand `MosaicProvider` an adapter so a Mosaic navigation and the host's page change in the same commit, and so the host's own navigations reach the component without a `popstate`:

```tsx
<MosaicProvider routing={{ adapter: nextRouterAdapter }}>
```

A `RouterAdapter` is a plain object of optional members: `usePathname` and `useHash` are hooks returning that part of the URL as `window.location` has it, `useSearchParams` returns the query string or a `URLSearchParams`, and `push` and `replace` navigate the host router to a full URL. Each one the adapter does not have falls back to `window`. Build it once, outside render; the hooks it has are taken from the first render.

The Next.js App Router adapter is a file to copy, `packages/swingset/src/lib/mosaic-next-router-adapter.ts`. It is `usePathname` and `useSearchParams` from `next/navigation`, as they are. It has no `push` or `replace`: Mosaic writes `window.history` without Next's own history state, and Next then moves its hooks to the new URL without the server round trip `router.push` would make. Two things to know under Next: a component whose adapter has `useSearchParams` is client-rendered up to the nearest `Suspense` boundary in a statically rendered route, as any component calling that hook is; and a host with `trailingSlash` sees one redirect per navigation. Under a `basePath`, hash and query need nothing, since a write without `push` starts from `window`, which has it; path mode needs `push` and `replace` that prepend the base path, because Next's `usePathname` leaves it out and `window.history` does not add it.

## Own a segment

The component that owns a segment calls `useRouterScope` with a route table and the location options. Names are what the component uses; patterns are what the segment looks like.

```tsx
const routes = {
  account: '',
  security: 'security',
  statement: 'billing/statement/:statementId',
} as const;

const { route, params, go, scope } = useRouterScope(routes, { routing: 'virtual', path, root: 'account' });
```

- `root` is the route that lives at the base. Its pattern in the table is ignored in favour of the empty segment, and `go(root)` writes the empty segment. A segment nothing matches, the root's own segment included, shows the root at once and is replaced with the base.
- `notFound(parts)` may name the route a segment nothing matches goes to instead of the root, as the combined profile does for an unknown organization page; a route that needs params cannot be written without them, so naming one shows the root instead, with a warning.
- `route` is a name from the table and never undefined. If the table depends on data that has not arrived, pass `ready: false` until it has; `route` is then `undefined` and nothing is written, so an entry the table cannot match yet is kept. Passing `ready` at all makes `route` optional in the type, so the loading window is a decision, not a default.
- `go('statement', { statementId })` writes the segment for a name. Param types come from the pattern; a route without params takes none. There is no way to navigate to a URL from here; anything outside the segment is an exit through `clerk-js`.
- A pattern literal is written decoded, `api keys` not `api%20keys`; `:name` captures a part, `:name?` may be absent. The pattern `''` is the base itself.
- Render `<MosaicRoutingScope scope={scope}>` around children that route inside the segment. They call `useRouter(routes)` with their own table, read the same segment, and get `route: undefined` for a segment a sibling owns. They never redirect.

One owner per base on a page. Two scopes on the same base cannot loop while both fall back to the base, but the second keeps snapping the first back to its root on every navigation; the fix is a different `path` for one of them.

## Profiles

`UserProfile` and `OrganizationProfile` route their pages through `useProfilePagesController`, which builds the table from the page ids: the first page in navigation order is the root with no segment, every other page has the segment legacy used, `api-keys` for `apiKeys`, a custom page's `path` for a custom page, and `organization/...` for the organization pages in combined mode. `pageSegment` and `pageParts` in `profile-pages.layout.ts` are the one place that mapping lives.

For a host:

- A profile opens on its first page. Reorder with `pageOrder` if another page should come first. There is no prop for the opening page.
- `routing` picks the mode, `virtual` by default, and `path` sets the base, `/user` and `/organization` by default. Two profiles on one page need different bases. Both can be set once for every profile through the provider's `profile.userProfileProps` and `profile.organizationProfileProps`. In path mode `path` is where the profile is mounted.
- A profile that unmounts and mounts again starts on its first page, as it would after the host navigated away and back. One that is parked and shown again, by `Activity` or anything else that keeps its state, comes back on the page it was on.
- A custom page's `path` is its segment, exactly: no leading, trailing or doubled slash, no leading colon, no percent-encoding, and not the segment of one of the profile's built-in pages where that differs from the id, such as `api-keys`. A path that breaks a rule is left out with a warning saying what to write instead. Spaces and non-ASCII are fine.
- A profile shows its loading fallback until every model its pages depend on is ready. A page written before then, by a modal opening at it, is kept and shown once the pages are known.

## Modals

A modal surface declares a base with `path`, `/modal/<id>` by default, and a `routing`, virtual by default; the modal is open exactly while that base has an entry. `open(options)` writes `initialParts(options)` and the content mounts reading it; `close()` clears the entry. Content receives the base as `path` and routes under it like any owner.

```ts
export const userProfileModal = defineModalSurface<UserProfileModalOptions>({
  id: 'userProfile',
  variant: 'profile',
  load: () => import('./user-profile.modal-content'),
  path: '/modal/user',
  initialParts: options => pageParts(options?.page),
});
```

`useModal(userProfileModal).open({ page: 'security' })` is how a host opens a profile on a page. Opening on the first page writes its id, which the profile canonicalises to the base. The modal is open whenever its entry exists, so an entry written from outside opens it too, and its content loads whenever it is open, not only when the handle opened it.

In the hash and query modes opening pushes a history entry and closing replaces it, so Back closes the modal, a URL with the param opens it, and after a close the page has two entries for its own URL. A modal opened from another modal stacks on it, in every mode: an outside press or Escape closes the one on top only. Mosaic's own modals are virtual by default; `routing={{ modals: 'query' }}` on the provider puts them in the query string, `'hash'` in the hash, for every modal at once. In the pathname a modal lives under the page it opens from: `routing={{ modals: { routing: 'path', path: '/account' } }}` opens the user profile modal at `/account/modal/user/security` and closes back to `/account`, so that page's route has to accept the extra parts, and one modal at a time can be open. Changing any of it needs the provider remounted.

## Seeing it run

The swingset has a Routing section at `/routing`, `packages/swingset/src/app/(explorer)/routing`, that shows every mode on components with nothing in them but routing: the four modes with Back, reload and a host link into a step; a routed page under a routed modal; a modal opening a modal; two components side by side, which is where path mode stops; a single set of tabs in the pathname; and several sets of tabs on one page, as the segment, as the trailing part of a step, arriving after mount, and inside a modal. None of it needs a session. The live user profile and user button pages keep a mode switch for the real components.

## Tests

- The contract every mode keeps is in `src/routing/__tests__/location-contract.test.tsx`, run for all four modes. Add a behaviour there when it should hold in every mode, and add a mode there before anything else. A URL mode is tested against `window.history` directly, with a `popstate` for what the host does; the adapter path is covered in `url-location.test.tsx`.
- To test routing in a hook, wrap it in `VirtualStoreProvider` with an `initial` map of base to parts, and read the store with `useVirtualEntries` or `useVirtualSegment`.
- Feature tests render inside `MosaicProvider` and read entries the same way. `useVirtualSegment` returns `undefined` for a base with no entry, which is how a test tells "cleared" from "empty".

## Appendix: candidates for this guide

- Where the route lives for a flow with steps, once the first flow routes: a `Flow.Step` switching on `route`.
- A host writing an entry before showing an inline component, once a public handle for that exists.
