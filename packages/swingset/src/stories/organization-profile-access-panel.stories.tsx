import { space } from '@clerk/mosaic/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileAccessFixture } from './fixtures/organization-profile-access';

export { default as __source } from './organization-profile-access-panel.stories?raw';

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: space['4'] },
  actions: { display: 'flex', justifyContent: 'end', gap: space['2'] },
});

function AccessPanelPreview({ empty = false, errors = false }: { empty?: boolean; errors?: boolean }) {
  const { page, layout } = useOrganizationProfileAccessFixture({
    empty,
    failSave: errors,
    failTest: errors,
    failVerification: errors,
  });
  return (
    <div {...stylex.props(styles.stack)}>
      {layout.contentBackAction ? <div>{layout.contentBackAction}</div> : null}
      {page}
      {layout.contentFooter ? <div {...stylex.props(styles.actions)}>{layout.contentFooter}</div> : null}
    </div>
  );
}

export function Default() {
  return <AccessPanelPreview />;
}
export function Empty() {
  return <AccessPanelPreview empty />;
}
export function Errors() {
  return <AccessPanelPreview errors />;
}

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileAccessPanel',
  label: 'Access panel',
  navigation: { category: 'Panels' },
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-access-panel/access.view.tsx',
};
