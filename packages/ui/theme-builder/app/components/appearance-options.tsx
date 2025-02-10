import { useAppearanceStore } from '../stores/appearance-store';
import { ToggleGroup } from '../toggle-group';

export function AppearanceOptions() {
  const appearance = useAppearanceStore(state => state.appearance);
  const setAppearance = useAppearanceStore(state => state.setAppearance);
  const direction = useAppearanceStore(state => state.direction);
  const setDirection = useAppearanceStore(state => state.setDirection);
  const devMode = useAppearanceStore(state => state.devMode);
  const setDevMode = useAppearanceStore(state => state.setDevMode);
  const animations = useAppearanceStore(state => state.animations);
  const setAnimations = useAppearanceStore(state => state.setAnimations);

  return (
    <>
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
    </>
  );
}
