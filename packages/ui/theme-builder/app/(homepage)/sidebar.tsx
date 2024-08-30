'use client';

import { ToggleGroup } from '../components/toggle-group';
import { useAppearanceLayoutStore } from '../stores/appearance-layout-store';
import { useThemeBuilderStore } from '../stores/theme-builder-store';

export function Sidebar() {
  // Theme builder options
  const appearance = useThemeBuilderStore(state => state.appearance);
  const setAppearance = useThemeBuilderStore(state => state.setAppearance);
  const direction = useThemeBuilderStore(state => state.direction);
  const setDirection = useThemeBuilderStore(state => state.setDirection);
  // Appearance layout options
  const devMode = useAppearanceLayoutStore(state => state.devMode);
  const setDevMode = useAppearanceLayoutStore(state => state.setDevMode);
  const animations = useAppearanceLayoutStore(state => state.animations);
  const setAnimations = useAppearanceLayoutStore(state => state.setAnimations);
  return (
    <aside className='relative isolate flex h-full w-[17rem] flex-col justify-between gap-8 overflow-y-auto border-e bg-white p-4'>
      <div className='space-y-4'>
        <ToggleGroup
          label='Appearance'
          items={[
            {
              label: 'Light',
              value: 'light',
            },
            {
              label: 'Dark',
              value: 'dark',
            },
          ]}
          value={appearance}
          onValueChange={setAppearance}
        />
        <ToggleGroup
          label='Direction'
          items={[
            {
              label: 'LTR',
              value: 'ltr',
            },
            {
              label: 'RTL',
              value: 'rtl',
            },
          ]}
          value={direction}
          onValueChange={setDirection}
        />
        <ToggleGroup
          label='Dev mode'
          items={[
            {
              label: 'On',
              value: 'on',
            },
            {
              label: 'Off',
              value: 'off',
            },
          ]}
          value={devMode}
          onValueChange={setDevMode}
        />
        <ToggleGroup
          label='Animations'
          items={[
            {
              label: 'On',
              value: 'on',
            },
            {
              label: 'Off',
              value: 'off',
            },
          ]}
          value={animations}
          onValueChange={setAnimations}
        />
      </div>

      {/* <div className='space-y-4'>
            <AppearanceOptions />
            {appearance === 'light' ? (
              <>
                <ColorPicker
                  label='Accent'
                  description='The accent color used for interactive elements.'
                  color={lightAccent}
                  onChange={setLightAccent}
                />
                <ColorPicker
                  label='Gray'
                  description='The accent color used for interactive elements.'
                  color={lightGray}
                  onChange={setLightGray}
                />
                <ColorPicker
                  label='Background'
                  description='The accent color used for interactive elements.'
                  color={lightBackground}
                  onChange={setLightBackground}
                />
              </>
            ) : (
              <>
                <ColorPicker
                  label='Accent'
                  description='The accent color used for interactive elements.'
                  color={darkAccent}
                  onChange={setDarkAccent}
                />
                <ColorPicker
                  label='Gray'
                  description='The accent color used for interactive elements.'
                  color={darkGray}
                  onChange={setDarkGray}
                />
                <ColorPicker
                  label='Background'
                  description='The accent color used for interactive elements.'
                  color={darkBackground}
                  onChange={setDarkBackground}
                />
              </>
            )}
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='radius'
                className='text-xs font-medium text-neutral-700'
              >
                Radius
              </label>
              <input
                id='radius'
                value={radius}
                onChange={e => setRadius(e.target.value)}
                className='w-full rounded border p-2 text-xs'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='spacing-unit'
                className='text-xs font-medium text-neutral-700'
              >
                Spacing unit
              </label>
              <input
                id='spacing-unit'
                value={spacingUnit}
                onChange={e => setSpacingUnit(e.target.value)}
                className='w-full rounded border p-2 text-xs'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='font-size'
                className='text-xs font-medium text-neutral-700'
              >
                Font size
              </label>
              <input
                id='font-size'
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className='w-full rounded border p-2 text-xs'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <button
              type='button'
              className='w-full rounded border bg-white p-1.5 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100'
              onClick={handleReset}
            >
              Reset
            </button>
            <ThemeDialog
              trigger={
                <button
                  type='button'
                  className='w-full rounded border bg-white p-1.5 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100'
                >
                  View CSS
                </button>
              }
            >
              {css}
            </ThemeDialog>
          </div> */}
    </aside>
  );
}
