import { createPortal } from 'react-dom';

import { useRouter } from '../../../router';
import type { ScenarioKey } from './prototypeState';
import { PICKER_SCENARIOS, useAccessPrototype } from './prototypeState';

const selectStyle = { font: 'inherit', padding: '2px 4px', borderRadius: 4 };

/** Prototype-only: jump between the states on the design board, outside the component. */
export const ScenarioPicker = () => {
  const store = useAccessPrototype();
  const { navigate } = useRouter();
  if (typeof document === 'undefined' || navigator.userAgent.includes('jsdom')) {
    return null;
  }
  const start = (key: ScenarioKey) => {
    store.setScenario(key);
    const view = PICKER_SCENARIOS.find(entry => entry.key === key)?.open ?? {};
    void navigate('organization-access', { searchParams: new URLSearchParams(view) });
  };
  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        insetInlineEnd: 16,
        zIndex: 2147483000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 8,
        background: '#18181b',
        color: '#fafafa',
        font: '12px/1.2 ui-sans-serif, system-ui, sans-serif',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      Prototype
      <select
        aria-label='Prototype scenario'
        value={store.scenario}
        onChange={event => start(event.target.value as ScenarioKey)}
        style={selectStyle}
      >
        {PICKER_SCENARIOS.map(entry => (
          <option
            key={entry.key}
            value={entry.key}
          >
            {entry.label}
          </option>
        ))}
      </select>
      <button
        type='button'
        onClick={() => start(store.scenario)}
        style={{
          font: 'inherit',
          padding: '2px 8px',
          borderRadius: 4,
          border: '1px solid #3f3f46',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
    </div>,
    document.body,
  );
};
