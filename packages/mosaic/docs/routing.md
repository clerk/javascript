# Routing

How a Mosaic component keeps its place in the page's location, and how a host or a modal puts it there. The reasoning is in the [decision records](edrs/README.md); this guide is about using what they decided.

## The model

A component owns one segment of the location under a base. `/user` is the user profile's default base, so its Security page is the segment `security` under `/user`. Which page is open is the location's to say: the component reads its segment, derives a route from it, and navigates by writing a new one. It holds no routing state of its own, so Back, reload and deep links work by construction rather than by handling.

Where the segment lives is the component's `routing`:

- `virtual` keeps it in memory, in `MosaicProvider`, and the browser URL does not change. The default.
- `path` keeps it in the pathname under `path`, `/user/security`, as the legacy components do.
- `hash` and `query` keep it in one param per component, `#.user=security` or `?.user=security`.

The same component code runs in every mode. The host, not the component, decides where its segment lives.

## URL modes

- In `path` mode `path` is where the component is mounted, so a host with a catch-all route at `/account/[[...page]]` passes `path='/account'`. One component per page can use the pathname; a second one takes another mode.
- In `hash` and `query` mode the param's name is the component's base with dots for slashes and a leading dot, `.user`, `.modal.user`, so it never collides with the host's own params. `routing={{ keyPrefix: { query: 'clerk' } }}` puts a prefix in front, `clerk.user`; there is none by default. The value is the segment, so `?.user=billing%2Fstatement%2Fst_1` is the statement page. The host's other params are kept; a Mosaic write spells the query string the way `URLSearchParams` does, so `x%20y` becomes `x+y` and a bare `flag` becomes `flag=`.
- In `hash` mode the fragment is Mosaic's. A host anchor such as `#top` stops scrolling once a param sits beside it, and clicking one resets the component.
- A navigation pushes a history entry; a correction to the first page and a modal closing replace. Back moves through a component's pages. Reloading or sharing the URL opens the page it names.
- `routing` is fixed when the component mounts; a changed prop warns and is ignored. The profiles remount themselves on their first page when their prop changes.
- Without an adapter the URL modes read and write `window.location`. The server renders the first page and the client corrects it after hydration. A host router that is not given `push` and `replace` does not see Mosaic's history entries in its blockers or scroll restoration.

### The host router

Hand `MosaicProvider` an adapter so a Mosaic navigation and the host's page change in the same commit, and so the host's own navigations reach the component:

```tsx
<MosaicProvider routing={{ adapter: nextRouterAdapter }}>
```

A `RouterAdapter` is a plain object of optional members: `usePathname` and `useHash` are hooks returning that part of the URL as `window.location` has it, `useSearchParams` returns the query string or a `URLSearchParams`, and `push` and `replace` navigate the host router to a full URL. Each one the adapter does not have falls back to `window`. Build it once, outside render.

Under Next.js App Router, copy `packages/swingset/src/lib/mosaic-next-router-adapter.ts`: `usePathname` and `useSearchParams` from `next/navigation`, nothing else. Leave out `push` and `replace`; Mosaic writes `window.history` and Next picks the change up without the server round trip `router.push` would make. Three things to know:

- Every component under the provider calls `useSearchParams`, so a statically rendered route needs a `Suspense` boundary above the provider or `next build` fails, as it does for any component that calls that hook.
- Under a `basePath`, hash and query need nothing. Path mode needs the base path in both places Next leaves it out: `usePathname: () => basePath + usePathname()` in the adapter and `path={basePath + '/account'}` on the component.
- With `trailingSlash` on, a URL Mosaic wrote gets one redirect when it is loaded. A write itself makes no request.

Routers that keep their own copy of the location, React Router and TanStack among them, need `push` and `replace` as well as the reads, or a step never reaches them.

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

- `root` is the route that lives at the base. `go(root)` writes the empty segment, and a segment nothing matches shows the root and is corrected to the base.
- `notFound(parts)` may name the route an unknown segment goes to instead of the root, as the combined profile does for an unknown organization page.
- `route` is a name from the table and never undefined. If the table depends on data that has not arrived, pass `ready: false` until it has; `route` is then `undefined` and nothing is written, so a segment the table cannot match yet is kept.
- `go('statement', { statementId })` writes the segment for a name. Param types come from the pattern. There is no way to navigate to a URL from here; anything outside the segment is an exit through `clerk-js`.
- A pattern literal is written decoded, `api keys` not `api%20keys`; `:name` captures a part, `:name?` may be absent. The pattern `''` is the base itself. A part may contain any character, including a slash.
- Render `<MosaicRoutingScope scope={scope}>` around children that route inside the segment. They call `useRouter(routes)` with their own table, read the same segment, and never write.

One owner per base on a page. Two owners of one base keep correcting each other; give one of them another `path`.

## Profiles

`UserProfile`, `OrganizationProfile` and `Profile` route their pages through one table built from the page ids: the first page in navigation order is the root with no segment, every other page has the segment legacy used, `api-keys` for `apiKeys`, a custom page's `path` for a custom page, and `organization/...` for the organization pages in combined mode.

- A profile opens on its first page. Reorder with `pageOrder` if another page should come first; there is no prop for the opening page.
- `routing` picks the mode and `path` the base, `/user` and `/organization` by default. Both can be set once for every profile through the provider's `profile.userProfileProps` and `profile.organizationProfileProps`. Two profiles on one page need different bases. In path mode `path` is where the profile is mounted.
- A profile that unmounts and mounts again starts on its first page. One that is parked and shown again, by `Activity` or anything else that keeps its state, comes back on the page it was on.
- A custom page's `path` is its segment, exactly: no leading, trailing or doubled slash, no leading colon, no percent-encoding, and not the segment of a built-in page. A path that breaks a rule is left out with a warning saying what to write instead.
- A profile shows its loading fallback until every model its pages depend on is ready. A page written before then, by a modal opening at it, is shown once the pages are known.

## Modals

A modal surface declares a base with `path`, `/modal/<id>` by default; the modal is open exactly while that base has an entry. `open(options)` writes `initialParts(options)` and the content mounts reading it; `close()` clears the entry. Content receives the base as `path` and routes under it like any owner.

```ts
export const userProfileModal = defineModalSurface<UserProfileModalOptions>({
  id: 'userProfile',
  variant: 'profile',
  load: () => import('./user-profile.modal-content'),
  path: '/modal/user',
  initialParts: options => pageParts(options?.page),
});
```

`useModal(userProfileModal).open({ page: 'security' })` opens a profile on a page. An entry written from outside, by a link or a URL, opens the modal too, and its content loads whenever it is open.

Mosaic's own modals are virtual by default; `routing={{ modals: 'query' }}` on the provider puts them in the query string, `'hash'` in the hash, for every modal at once. In those modes opening pushes a history entry and closing replaces it, so Back closes the modal and a URL with the param opens it. Modals never use the pathname. A virtual modal closes when the host moves to another pathname; a change of the query string or the hash leaves it open. A modal opened from another modal stacks on it: an outside press or Escape closes the one on top only.

## Links

A link to a component's page is the query mode's param, in every mode. `?.user=security` lands the owner of `/user` on Security, and `?.modal.user=account` opens the profile modal on Account, whether they route in memory, the pathname, the hash or the query string. A host links to a page with it, and a redirect returns through it.

- In query mode the param is the component's entry and stays in the URL. In the other modes the owner moves the page to its own place and removes the param.
- Links are read from the query string only, and whenever the URL changes, so a `<Link href="?.user=security">` on a page that stays mounted works.
- When the owner mounts with a page already in its own place, that page wins and the link is removed unused: a reload of a URL that already names the page. A link that arrives after mount is followed whatever page is open.
- A link for a base nothing owns stays in the URL until an owner mounts.

### Returning after a redirect

A flow that leaves the page and comes back, such as an OAuth or enterprise connection, hands Clerk the URL to return to. Build it with `useReturnUrl`, anywhere `useRouter` can be called:

```ts
const returnUrl = useReturnUrl(routes);

await user.createExternalAccount({ strategy, redirectUrl: returnUrl('account') });
```

`returnUrl(name, params)` is typed like `go` and returns the page's URL as it is when called, with the route for the scope's owner written into it. It never navigates. Outside a scope it returns the page's URL unchanged.

What comes back is the route and nothing else. A modal reopened by a link gets the provider's `profile` options, a flow's machine starts in its first state, and a section reads its resources again, which is what shows the result of the redirect. The profile sections that redirect return to the account page of the profile they left, modal or inline.

## Seeing it run

The swingset has a Routing section at `/routing`, `packages/swingset/src/app/(explorer)/routing`, that shows every mode on components with nothing in them but routing: a page with host links into its steps, two components side by side, a modal and a modal on a modal, tabs in the pathname, multiple tabs on one page, and a page with modals opened from inside it. None of it needs a session. The live user profile and switcher pages keep a mode switch for the real components.

## Tests

- The contract every mode keeps is in `src/routing/__tests__/location-contract.test.tsx`, run for all four modes. Add a behaviour there when it should hold in every mode, and add a mode there before anything else.
- To test routing in a hook, wrap it in `RoutingConfigProvider` and `VirtualStoreProvider` with an `initial` map of base to parts, and read the store with `useVirtualEntries` or `useVirtualSegment`. Both providers are needed: writes to `window.history` wait for the provider to settle.
- Feature tests render inside `MosaicProvider` and read entries the same way. `useVirtualSegment` returns `undefined` for a base with no entry, which is how a test tells "cleared" from "empty".
