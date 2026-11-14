'use client';

import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';

import { withoutUserComingSoon } from '@/lib/components/pages';
import { SCENE_THEME_CSS, SCENE_THEMES, type SceneThemeChoice } from '@/lib/components/scene-themes';

const RENDER_W = 1200;
const SCALE = 0.75;

function ThemedProfile({ theme }: { theme: SceneThemeChoice }) {
  const fixture = useUserProfileFixture();
  return (
    <div
      className='overflow-hidden'
      style={{ width: RENDER_W * SCALE, height: 720 * SCALE }}
    >
      <div
        data-scene-theme={theme}
        className='origin-top-left'
        style={{ width: RENDER_W, scale: SCALE }}
      >
        <UserProfileView
          activePage={fixture.activePage}
          pages={withoutUserComingSoon(fixture.pages)}
          onPageChange={fixture.setActivePage}
        />
      </div>
    </div>
  );
}

const ENTRIES: { id: SceneThemeChoice; label: string; description: string }[] = [
  { id: 'default', label: 'Default', description: 'Mosaic on the site palette' },
  ...SCENE_THEMES,
];

export function ThemeLab() {
  return (
    <div className='mx-auto w-full max-w-[1280px] px-6 pb-32 pt-16'>
      <style>{SCENE_THEME_CSS}</style>
      <p className='label-3 text-gray-500'>Temporary</p>
      <h1 className='heading-3 mt-2 text-gray-950 dark:text-white'>Theme lab</h1>
      <p className='body-2 mt-2 max-w-xl text-gray-600 dark:text-gray-400'>
        Three directions for the Themeable scene, against the default. Each one changes only tokens and slot classes.
        Toggle the site theme to check dark.
      </p>
      <div className='mt-12 flex flex-col gap-16'>
        {ENTRIES.map(entry => (
          <section key={entry.label}>
            <div className='mb-3 flex items-baseline gap-2'>
              <span className='label-3 text-gray-950 dark:text-white'>{entry.label}</span>
              <span className='body-3 text-gray-500'>{entry.description}</span>
            </div>
            <ThemedProfile theme={entry.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
