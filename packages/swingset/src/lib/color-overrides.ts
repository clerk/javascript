export type ColorMode = 'light' | 'dark';

export type ColorSides = Partial<Record<ColorMode, string>>;

export interface ColorPreset {
  id: string;
  label: string;
  vars: Record<string, ColorSides>;
}

export const colorPresets: ColorPreset[] = [
  { id: 'default', label: 'Default', vars: {} },
  {
    id: 'gray',
    label: 'Gray',
    vars: {
      '--cl-color-page': { light: '#f2f2f3', dark: 'oklch(0.2 0 0)' },
      '--cl-color-neutral': { light: 'oklch(0.05 0.002 280)', dark: 'oklch(0.98 0.002 280)' },
    },
  },
  {
    id: 'warm-gray',
    label: 'Warm gray',
    vars: {
      '--cl-color-page': { light: 'oklch(0.96 0.004 75)', dark: 'oklch(0.19 0.005 70)' },
      '--cl-color-neutral': { light: 'oklch(0.05 0.01 75)', dark: 'oklch(0.98 0.01 80)' },
    },
  },
  {
    id: 'cool-gray',
    label: 'Cool gray',
    vars: {
      '--cl-color-page': { light: 'oklch(0.96 0.004 250)', dark: 'oklch(0.19 0.008 255)' },
      '--cl-color-neutral': { light: 'oklch(0.05 0.01 255)', dark: 'oklch(0.98 0.01 250)' },
    },
  },
];

const overrides = new Map<string, ColorSides>();
const listeners = new Set<() => void>();
let version = 0;
let activePreset = 'default';

function emit() {
  version += 1;
  listeners.forEach(listener => listener());
}

function probe(name: string, mode: ColorMode): string {
  const element = document.createElement('span');
  element.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color-scheme:${mode};background:var(${name})`;
  document.documentElement.appendChild(element);
  const resolved = getComputedStyle(element).backgroundColor;
  element.remove();
  return resolved;
}

function applyOverrides() {
  const style = document.documentElement.style;
  overrides.forEach((_, name) => style.removeProperty(name));
  for (let pass = 0; pass < 2; pass += 1) {
    overrides.forEach((sides, name) => {
      if (pass === 1) {
        if (sides.light !== undefined && sides.dark !== undefined) {
          return;
        }
        style.removeProperty(name);
      }
      const light = sides.light ?? probe(name, 'light');
      const dark = sides.dark ?? probe(name, 'dark');
      style.setProperty(name, `light-dark(${light}, ${dark})`);
    });
  }
}

export { probe };

export function subscribeColors(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getColorVersion() {
  return version;
}

export function getOverride(name: string): ColorSides | undefined {
  return overrides.get(name);
}

export function getOverrideCount() {
  return overrides.size;
}

export function getActivePreset() {
  return activePreset;
}

function setSide(name: string, mode: ColorMode, value: string) {
  const sides: ColorSides = { ...overrides.get(name) };
  if (value) {
    sides[mode] = value;
  } else {
    delete sides[mode];
  }
  if (sides.light === undefined && sides.dark === undefined) {
    overrides.delete(name);
  } else {
    overrides.set(name, sides);
  }
}

export function setOverride(name: string, mode: ColorMode, value: string) {
  setSide(name, mode, value);
  activePreset = overrides.size === 0 ? 'default' : 'custom';
  applyOverrides();
  emit();
}

export function resetOverride(name: string, mode?: ColorMode) {
  if (mode) {
    setOverride(name, mode, '');
    return;
  }
  overrides.delete(name);
  activePreset = overrides.size === 0 ? 'default' : 'custom';
  applyOverrides();
  emit();
}

export function applyPreset(id: string) {
  const preset = colorPresets.find(entry => entry.id === id);
  if (!preset) {
    return;
  }
  const style = document.documentElement.style;
  overrides.forEach((_, name) => style.removeProperty(name));
  overrides.clear();
  Object.entries(preset.vars).forEach(([name, sides]) => overrides.set(name, { ...sides }));
  applyOverrides();
  activePreset = id;
  emit();
}

export function resetAll() {
  const style = document.documentElement.style;
  overrides.forEach((_, name) => style.removeProperty(name));
  overrides.clear();
  activePreset = 'default';
  emit();
}
