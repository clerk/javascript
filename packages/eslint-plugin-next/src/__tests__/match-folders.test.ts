import { describe, expect, it } from 'vitest';

import { classifyFolder, hasDescendantsMatching, literalPrefix, matchPath, specificity } from '../lib/match-folders.js';

describe('matchPath', () => {
  it('matches literal segments', () => {
    expect(matchPath('app', 'app')).toBe(true);
    expect(matchPath('app', 'foo')).toBe(false);
    expect(matchPath('app/foo', 'app/foo')).toBe(true);
    expect(matchPath('app/foo', 'app/bar')).toBe(false);
  });

  it('** matches zero or more whole segments', () => {
    expect(matchPath('app/**', 'app')).toBe(true);
    expect(matchPath('app/**', 'app/foo')).toBe(true);
    expect(matchPath('app/**', 'app/foo/bar')).toBe(true);
    expect(matchPath('app/**', 'other/foo')).toBe(false);
  });

  it('* matches a single segment, not separators', () => {
    expect(matchPath('app/*', 'app/foo')).toBe(true);
    expect(matchPath('app/*', 'app/foo/bar')).toBe(false);
    expect(matchPath('app/*', 'app')).toBe(false);
  });

  it('treats parentheses in patterns literally (route groups)', () => {
    expect(matchPath('app/(routes)/**', 'app/(routes)/foo')).toBe(true);
    expect(matchPath('app/(routes)/**', 'app/foo')).toBe(false);
    expect(matchPath('app/(routes)/(unauthenticated)/**', 'app/(routes)/(unauthenticated)/sign-in')).toBe(true);
  });

  it('treats brackets in patterns literally (dynamic segments)', () => {
    expect(matchPath('app/[id]', 'app/[id]')).toBe(true);
    expect(matchPath('app/[id]', 'app/foo')).toBe(false);
  });

  it('treats @-prefixed parallel slot folders as literal', () => {
    expect(matchPath('app/(overview)/@production', 'app/(overview)/@production')).toBe(true);
  });
});

describe('matchPath with complex wildcard combinations', () => {
  it('** at the start matches paths with any prefix', () => {
    expect(matchPath('**/admin', 'admin')).toBe(true);
    expect(matchPath('**/admin', 'app/admin')).toBe(true);
    expect(matchPath('**/admin', 'app/foo/admin')).toBe(true);
    expect(matchPath('**/admin', 'app/foo/bar/admin')).toBe(true);
    expect(matchPath('**/admin', 'app/admin/users')).toBe(false);
    expect(matchPath('**/admin', 'admin-route')).toBe(false);
  });

  it('** in the middle bridges arbitrary depth', () => {
    expect(matchPath('app/**/admin', 'app/admin')).toBe(true);
    expect(matchPath('app/**/admin', 'app/foo/admin')).toBe(true);
    expect(matchPath('app/**/admin', 'app/foo/bar/admin')).toBe(true);
    expect(matchPath('app/**/admin', 'app/admin/users')).toBe(false);
    expect(matchPath('app/**/admin', 'other/admin')).toBe(false);
  });

  it('** at start AND end matches anything containing the literal segment', () => {
    expect(matchPath('**/admin/**', 'admin')).toBe(true);
    expect(matchPath('**/admin/**', 'admin/users')).toBe(true);
    expect(matchPath('**/admin/**', 'app/admin/users')).toBe(true);
    expect(matchPath('**/admin/**', 'a/b/admin/c/d')).toBe(true);
    expect(matchPath('**/admin/**', 'app/users')).toBe(false);
  });

  it('multiple ** segments compose without backtracking issues', () => {
    expect(matchPath('app/**/admin/**/details', 'app/admin/details')).toBe(true);
    expect(matchPath('app/**/admin/**/details', 'app/foo/admin/bar/details')).toBe(true);
    expect(matchPath('app/**/admin/**/details', 'app/foo/admin/bar/baz/details')).toBe(true);
    expect(matchPath('app/**/admin/**/details', 'app/admin/details/extra')).toBe(false);
  });

  it('* matches mid-segment as a prefix or suffix wildcard', () => {
    expect(matchPath('app/foo*', 'app/foo')).toBe(true);
    expect(matchPath('app/foo*', 'app/foobar')).toBe(true);
    expect(matchPath('app/foo*', 'app/foo/bar')).toBe(false);
    expect(matchPath('app/*-route', 'app/admin-route')).toBe(true);
    expect(matchPath('app/*-route', 'app/admin')).toBe(false);
    expect(matchPath('app/[*]-route', 'app/[admin]-route')).toBe(true);
  });

  it('combines * and ** in the same pattern', () => {
    expect(matchPath('app/*/admin/**', 'app/foo/admin/users')).toBe(true);
    expect(matchPath('app/*/admin/**', 'app/admin/users')).toBe(false);
    expect(matchPath('app/*/admin/**', 'app/foo/bar/admin/users')).toBe(false);
    expect(matchPath('app/**/page-*', 'app/foo/page-home')).toBe(true);
    expect(matchPath('app/**/page-*', 'app/page-home')).toBe(true);
  });

  it('** alone matches everything including the empty path', () => {
    expect(matchPath('**', '')).toBe(true);
    expect(matchPath('**', 'app')).toBe(true);
    expect(matchPath('**', 'app/foo/bar')).toBe(true);
  });
});

describe('specificity', () => {
  it('counts only literal (non-wildcard) segments', () => {
    expect(specificity('app/**')).toBe(1);
    expect(specificity('app/(routes)/**')).toBe(2);
    expect(specificity('app/(routes)/(unauthenticated)/**')).toBe(3);
    expect(specificity('app/*/foo')).toBe(2);
    expect(specificity('**')).toBe(0);
    expect(specificity('app/foo/bar')).toBe(3);
  });

  it('treats ** as zero specificity regardless of position', () => {
    expect(specificity('**/admin')).toBe(1);
    expect(specificity('app/**/admin')).toBe(2);
    expect(specificity('app/**/admin/**')).toBe(2);
    expect(specificity('**/admin/**/users')).toBe(2);
  });

  it('treats segments containing * as zero specificity', () => {
    expect(specificity('app/foo*')).toBe(1);
    expect(specificity('app/*-route')).toBe(1);
    expect(specificity('app/foo*/bar')).toBe(2);
    expect(specificity('*/admin')).toBe(1);
    expect(specificity('app/*/*/foo')).toBe(2);
  });
});

describe('classifyFolder', () => {
  it('returns unmatched when no list matches', () => {
    expect(classifyFolder('other/foo', { protected: ['app/**'], public: [] })).toBe('unmatched');
  });

  it('returns protected when only protect matches', () => {
    expect(classifyFolder('app/foo', { protected: ['app/**'], public: [] })).toBe('protected');
  });

  it('returns public when only public matches', () => {
    expect(classifyFolder('app/foo', { protected: [], public: ['app/**'] })).toBe('public');
  });

  it('most specific wins when both lists match (broad protect, narrow public)', () => {
    expect(
      classifyFolder('app/(routes)/(unauthenticated)/sign-in', {
        protected: ['app/**'],
        public: ['app/(routes)/(unauthenticated)/**'],
      }),
    ).toBe('public');
  });

  it('most specific wins when both lists match (broad public, narrow protect)', () => {
    expect(
      classifyFolder('app/admin/users', {
        protected: ['app/admin/**'],
        public: ['app/**'],
      }),
    ).toBe('protected');
  });

  it('protect wins on exact specificity tie (identical patterns)', () => {
    expect(
      classifyFolder('app/foo', {
        protected: ['app/foo'],
        public: ['app/foo'],
      }),
    ).toBe('protected');
  });

  it('protect wins on exact specificity tie (different patterns, same literal count)', () => {
    expect(
      classifyFolder('app/foo', {
        protected: ['app/**'],
        public: ['app/**'],
      }),
    ).toBe('protected');
  });

  it('handles ** in the middle of patterns when computing specificity', () => {
    // Public has 2 literal segments (app + admin), protect has 1 (app).
    // Public should win.
    expect(
      classifyFolder('app/foo/admin/users', {
        protected: ['app/**'],
        public: ['app/**/admin/**'],
      }),
    ).toBe('public');
  });

  it('takes the highest-specificity match within each list', () => {
    // Two protect patterns match; the most specific one (3) is what counts
    // when comparing against public (2).
    expect(
      classifyFolder('app/admin/users/details', {
        protected: ['app/**', 'app/admin/users/**'],
        public: ['app/**/users/**'],
      }),
    ).toBe('protected');
  });

  it('classifies correctly when only mid-pattern wildcards match', () => {
    expect(
      classifyFolder('app/marketing/sign-in', {
        protected: ['app/**'],
        public: ['app/**/sign-in'],
      }),
    ).toBe('public');
  });

  it('** can match a folder identical to a literal-prefix pattern', () => {
    // Both `app/admin` (specificity 2) and `app/**` (specificity 1) match
    // `app/admin`. Most specific wins.
    expect(
      classifyFolder('app/admin', {
        protected: ['app/admin'],
        public: ['app/**'],
      }),
    ).toBe('protected');
  });
});

describe('literalPrefix', () => {
  it('returns segments up to the first wildcard', () => {
    expect(literalPrefix('app/(routes)/(unauthenticated)/**')).toBe('app/(routes)/(unauthenticated)');
    expect(literalPrefix('app/admin/billing/**')).toBe('app/admin/billing');
    expect(literalPrefix('app/foo')).toBe('app/foo');
    expect(literalPrefix('app/*')).toBe('app');
    expect(literalPrefix('app/**/admin')).toBe('app');
    expect(literalPrefix('**')).toBe('');
  });

  it('returns empty when the first segment is a wildcard', () => {
    expect(literalPrefix('**/admin')).toBe('');
    expect(literalPrefix('*/admin')).toBe('');
    expect(literalPrefix('*')).toBe('');
  });

  it('stops at mid-segment wildcards just like full-segment wildcards', () => {
    expect(literalPrefix('app/foo*/bar')).toBe('app');
    expect(literalPrefix('app/*-route')).toBe('app');
    expect(literalPrefix('app/admin/page-*')).toBe('app/admin');
  });

  it('preserves trailing literal segments after a literal run', () => {
    // Pattern is fully literal — prefix is the whole thing.
    expect(literalPrefix('app/admin/users/details')).toBe('app/admin/users/details');
  });
});

describe('hasDescendantsMatching', () => {
  it('returns true when a pattern lies strictly under the folder', () => {
    expect(hasDescendantsMatching('app', ['app/(routes)/(unauthenticated)/**'])).toBe(true);
    expect(hasDescendantsMatching('app/(routes)', ['app/(routes)/(unauthenticated)/**'])).toBe(true);
  });

  it('returns true when a pattern equals the folder', () => {
    expect(hasDescendantsMatching('app/admin', ['app/admin'])).toBe(true);
  });

  it('returns false when no pattern lies under the folder', () => {
    expect(hasDescendantsMatching('app/(routes)/(org-level)', ['app/(routes)/(unauthenticated)/**'])).toBe(false);
    expect(hasDescendantsMatching('app/admin/users', ['app/feed/**'])).toBe(false);
  });

  it('ignores fully-wildcard patterns (empty literal prefix)', () => {
    expect(hasDescendantsMatching('app/admin', ['**'])).toBe(false);
  });

  it('returns false on empty/missing pattern list', () => {
    expect(hasDescendantsMatching('app', [])).toBe(false);
    expect(hasDescendantsMatching('app', undefined)).toBe(false);
  });

  it('considers patterns whose entire literal prefix is "app/foo" descendants of "app"', () => {
    // Pattern can match below `app`; folder is `app`. Returns true.
    expect(hasDescendantsMatching('app', ['app/foo/bar/**'])).toBe(true);
    // Pattern's prefix exactly matches the folder. Returns true.
    expect(hasDescendantsMatching('app', ['app/**'])).toBe(true);
  });

  it('ignores patterns starting with a wildcard segment', () => {
    // `**/foo` has empty literal prefix; `hasDescendantsMatching` ignores it
    // because a fully-wildcard pattern technically matches everywhere and
    // would make every folder "have descendants", which is not the question.
    // This means a public pattern like `**/sign-in` would NOT be detected
    // as creating a mixed-scope layout above it. Known limitation.
    expect(hasDescendantsMatching('app/admin', ['**/sign-in'])).toBe(false);
    expect(hasDescendantsMatching('app/admin', ['*/sign-in'])).toBe(false);
  });

  it('ignores patterns whose first wildcard appears at an ancestor of the folder', () => {
    // Pattern `app/*/sign-in` could match `app/foo/sign-in`, which IS under
    // `app/foo`. Ideally hasDescendantsMatching would return true, but the
    // current implementation only inspects literal prefixes, so it returns
    // false. Documented as a known limitation; in practice public lists are
    // written with concrete prefixes (`app/(unauthenticated)/**`) rather
    // than wildcard-in-the-middle, which sidesteps the issue.
    expect(hasDescendantsMatching('app/foo', ['app/*/sign-in'])).toBe(false);
  });

  it('handles deeply nested folder paths against deeply nested patterns', () => {
    expect(hasDescendantsMatching('app/(routes)', ['app/(routes)/(unauthenticated)/sign-in/[[...index]]/**'])).toBe(
      true,
    );
    expect(
      hasDescendantsMatching('app/(routes)/(unauthenticated)/sign-in', ['app/(routes)/(unauthenticated)/**']),
    ).toBe(false); // pattern's prefix is an ancestor of folder, not descendant
  });
});
