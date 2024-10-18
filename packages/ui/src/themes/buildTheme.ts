import type { ParsedElements, PartialTheme } from '~/contexts/AppearanceContext';
import { DESCRIPTORS } from '~/descriptors';

/**
 * Given an object containing partial descriptors, returns a full ParsedElements object with generated descriptors.
 */
export function buildTheme(p: PartialTheme): ParsedElements {
  const theme: Partial<ParsedElements> = {};
  const suppliedDescriptors = new Set<string>();

  // Setup base theme containing empty objects for each descriptor.
  DESCRIPTORS.forEach(descriptor => {
    theme[descriptor] = {
      descriptor: `cl-${descriptor}`,
      className: '',
      style: {},
    };
  });

  theme['buttonConnection__apple'] = {
    descriptor: `cl-buttonConnection__apple`,
    className: '',
    style: {},
  };
  theme['buttonConnection__atlassian'] = {
    descriptor: `cl-buttonConnection__atlassian`,
    className: '',
    style: {},
  };
  theme['buttonConnection__bitbucket'] = {
    descriptor: `cl-buttonConnection__bitbucket`,
    className: '',
    style: {},
  };
  theme['buttonConnection__box'] = {
    descriptor: `cl-buttonConnection__box`,
    className: '',
    style: {},
  };
  theme['buttonConnection__coinbase_wallet'] = {
    descriptor: `cl-buttonConnection__coinbase_wallet`,
    className: '',
    style: {},
  };
  theme['buttonConnection__coinbase'] = {
    descriptor: `cl-buttonConnection__coinbase`,
    className: '',
    style: {},
  };
  theme['buttonConnection__discord'] = {
    descriptor: `cl-buttonConnection__discord`,
    className: '',
    style: {},
  };
  theme['buttonConnection__dropbox'] = {
    descriptor: `cl-buttonConnection__dropbox`,
    className: '',
    style: {},
  };
  theme['buttonConnection__enstall'] = {
    descriptor: `cl-buttonConnection__enstall`,
    className: '',
    style: {},
  };
  theme['buttonConnection__facebook'] = {
    descriptor: `cl-buttonConnection__facebook`,
    className: '',
    style: {},
  };
  theme['buttonConnection__github'] = {
    descriptor: `cl-buttonConnection__github`,
    className: '',
    style: {},
  };
  theme['buttonConnection__gitlab'] = {
    descriptor: `cl-buttonConnection__gitlab`,
    className: '',
    style: {},
  };
  theme['buttonConnection__google'] = {
    descriptor: `cl-buttonConnection__google`,
    className: '',
    style: {},
  };
  theme['buttonConnection__hubspot'] = {
    descriptor: `cl-buttonConnection__hubspot`,
    className: '',
    style: {},
  };
  theme['buttonConnection__huggingface'] = {
    descriptor: `cl-buttonConnection__huggingface`,
    className: '',
    style: {},
  };
  theme['buttonConnection__instagram'] = {
    descriptor: `cl-buttonConnection__instagram`,
    className: '',
    style: {},
  };
  theme['buttonConnection__line'] = {
    descriptor: `cl-buttonConnection__line`,
    className: '',
    style: {},
  };
  theme['buttonConnection__linear'] = {
    descriptor: `cl-buttonConnection__linear`,
    className: '',
    style: {},
  };
  theme['buttonConnection__linkedin_oidc'] = {
    descriptor: `cl-buttonConnection__linkedin_oidc`,
    className: '',
    style: {},
  };
  theme['buttonConnection__linkedin'] = {
    descriptor: `cl-buttonConnection__linkedin`,
    className: '',
    style: {},
  };
  theme['buttonConnection__metamask'] = {
    descriptor: `cl-buttonConnection__metamask`,
    className: '',
    style: {},
  };
  theme['buttonConnection__microsoft'] = {
    descriptor: `cl-buttonConnection__microsoft`,
    className: '',
    style: {},
  };
  theme['buttonConnection__notion'] = {
    descriptor: `cl-buttonConnection__notion`,
    className: '',
    style: {},
  };
  theme['buttonConnection__slack'] = {
    descriptor: `cl-buttonConnection__slack`,
    className: '',
    style: {},
  };
  theme['buttonConnection__spotify'] = {
    descriptor: `cl-buttonConnection__spotify`,
    className: '',
    style: {},
  };
  theme['buttonConnection__tiktok'] = {
    descriptor: `cl-buttonConnection__tiktok`,
    className: '',
    style: {},
  };
  theme['buttonConnection__twitch'] = {
    descriptor: `cl-buttonConnection__twitch`,
    className: '',
    style: {},
  };
  theme['buttonConnection__twitter'] = {
    descriptor: `cl-buttonConnection__twitter`,
    className: '',
    style: {},
  };
  theme['buttonConnection__x'] = {
    descriptor: `cl-buttonConnection__x`,
    className: '',
    style: {},
  };
  theme['buttonConnection__xero'] = {
    descriptor: `cl-buttonConnection__xero`,
    className: '',
    style: {},
  };

  for (const descriptor in p) {
    const key = descriptor as keyof ParsedElements;

    if (p[key]) {
      if (!(key in theme)) {
        console.warn(`Clerk: Unknown descriptor: ${descriptor}`);
        continue;
      }

      // These non-null assertions are okay since we confirmed that theme contains the descriptor above.
      const { className, style } = p[key]!;
      if (className) {
        theme[key]!.className = className;
      }

      if (style) {
        theme[key]!.style = style;
      }

      suppliedDescriptors.add(descriptor);
    }
  }

  const missingDescriptors = DESCRIPTORS.filter(d => !suppliedDescriptors.has(d));
  if (missingDescriptors.length > 0) {
    console.warn(
      `Clerk: Missing style configuration for the following descriptors:\n- ${missingDescriptors.join('\n- ')}`,
    );
  }

  return theme as ParsedElements;
}

/**
 * Given two complete theme objects, merge their className and style properties to create a new merged theme.
 */
export function mergeTheme(a: ParsedElements, b: ParsedElements): ParsedElements {
  const mergedTheme = { ...a };

  for (const d in mergedTheme) {
    const descriptor = d as keyof ParsedElements;
    mergedTheme[descriptor].className = [mergedTheme[descriptor].className, b[descriptor].className].join(' ');
    mergedTheme[descriptor].style = { ...mergedTheme[descriptor].style, ...b[descriptor].style };
  }

  return mergedTheme;
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('buildTheme', () => {
    it('returns a theme containing all descriptors', () => {
      const theme = buildTheme({});
      expect(Object.keys(theme).sort()).toStrictEqual(
        [
          ...DESCRIPTORS,
          'buttonConnection__apple',
          'buttonConnection__atlassian',
          'buttonConnection__bitbucket',
          'buttonConnection__box',
          'buttonConnection__coinbase_wallet',
          'buttonConnection__coinbase',
          'buttonConnection__discord',
          'buttonConnection__dropbox',
          'buttonConnection__enstall',
          'buttonConnection__facebook',
          'buttonConnection__github',
          'buttonConnection__gitlab',
          'buttonConnection__google',
          'buttonConnection__hubspot',
          'buttonConnection__huggingface',
          'buttonConnection__instagram',
          'buttonConnection__line',
          'buttonConnection__linear',
          'buttonConnection__linkedin_oidc',
          'buttonConnection__linkedin',
          'buttonConnection__metamask',
          'buttonConnection__microsoft',
          'buttonConnection__notion',
          'buttonConnection__slack',
          'buttonConnection__spotify',
          'buttonConnection__tiktok',
          'buttonConnection__twitch',
          'buttonConnection__twitter',
          'buttonConnection__x',
          'buttonConnection__xero',
        ].sort(),
      );

      for (const [k, v] of Object.entries(theme)) {
        expect(v.descriptor).toEqual(`cl-${k}`);
        expect(v.className).toEqual('');
        expect(v.style).toStrictEqual({});
      }
    });
  });
}
