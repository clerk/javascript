# Routing

How a Mosaic component owns a segment of the page's location, and how a host or a modal moves it there. The reasons behind the shape are in the [decision records](edrs/README.md); read them before changing anything under `src/routing`.

## The model

A component owns one segment of the location under a base. `/user` is the user profile's default base, so its Security page is the segment `security` under `/user`. Which page is open is the location's to say, never the component's: the component reads its segment, derives a route from it, and navigates by writing a new segment. It holds no routing state of its own.

Today the only mode is `virtual`: the segments live in memory in `MosaicProvider`, keyed by base, and the browser URL does not change. The same code will run against the pathname, the hash or a query param later; components do not know which.

A segment lives while a mounted component owns it. Navigate away and it is gone; come back and the component starts on its root. A component that React parks without unmounting, as `Activity` does, keeps its segment and resumes where it was. Virtual mode has no history: Back does not restore a segment the way a URL mode will.

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
- `route` is a name from the table and never undefined. If the table depends on data that has not arrived, pass `ready: false` until it has; `route` is then `undefined` and nothing is written, so an entry the table cannot match yet is kept. Passing `ready` at all makes `route` optional in the type, so the loading window is a decision, not a default.
- `go('statement', { statementId })` writes the segment for a name. Param types come from the pattern; a route without params takes none. There is no way to navigate to a URL from here; anything outside the segment is an exit through `clerk-js`.
- A pattern literal is written decoded, `api keys` not `api%20keys`; `:name` captures a part, `:name?` may be absent. The pattern `''` is the base itself.
- Render `<MosaicRoutingScope scope={scope}>` around children that route inside the segment. They call `useRouter(routes)` with their own table, read the same segment, and get `route: undefined` for a segment a sibling owns. They never redirect.

One owner per base on a page. Two scopes on the same base cannot loop, since both fall back to the base, but the second keeps snapping the first back to its root on every navigation; the fix is a different `path` for one of them.

## Profiles

`UserProfile` and `OrganizationProfile` route their pages through `useProfilePagesController`, which builds the table from the page ids: the first page in navigation order is the root with no segment, every other page has the segment legacy used, `api-keys` for `apiKeys`, a custom page's `path` for a custom page, and `organization/...` for the organization pages in combined mode. `pageSegment` and `pageParts` in `profile-pages.layout.ts` are the one place that mapping lives.

For a host:

- A profile opens on its first page. Reorder with `pageOrder` if another page should come first. There is no prop for the opening page.
- `path` sets the base, `/user` and `/organization` by default. Two profiles on one page need different bases.
- A profile that unmounts and mounts again starts on its first page, as it would after the host navigated away and back. One that is parked and shown again, by `Activity` or anything else that keeps its state, comes back on the page it was on.
- A custom page's `path` is its segment, exactly: no leading, trailing or doubled slash, no leading colon, no percent-encoding, and not the segment of one of the profile's built-in pages where that differs from the id, such as `api-keys`. A path that breaks a rule is left out with a warning saying what to write instead. Spaces and non-ASCII are fine.
- A profile shows its loading fallback until every model its pages depend on is ready. A page written before then, by a modal opening at it, is kept and shown once the pages are known.

## Modals

A modal surface declares a base with `path`, `/modal/<id>` by default, and the modal is open exactly while that base has an entry. `open(options)` writes `initialParts(options)` and the content mounts reading it; `close()` clears the entry. Content receives the base as `path` and routes under it like any owner.

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

## Tests

- The contract every mode keeps is in `src/routing/__tests__/location-contract.test.tsx`. Add a behaviour there when it should hold in every mode, and add a mode there before anything else.
- To test routing in a hook, wrap it in `VirtualStoreProvider` with an `initial` map of base to parts, and read the store with `useVirtualEntries` or `useVirtualSegment`.
- Feature tests render inside `MosaicProvider` and read entries the same way. `useVirtualSegment` returns `undefined` for a base with no entry, which is how a test tells "cleared" from "empty".

## Appendix: candidates for this guide

- Where the route lives for a flow with steps, once the first flow routes: a `Flow.Step` switching on `route`.
- The SSR story: virtual renders the same on server and client; a URL mode reads the request URL through the adapter.
- A host writing an entry before showing an inline component, once a public handle for that exists.
