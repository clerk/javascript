import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppearanceProvider, useAppearance } from '@/customizables';
import type { ParsedAppearance } from '@/customizables/parseAppearance';
import { FlowMetadataProvider } from '@/elements/contexts';
import { ModalContext } from '@/elements/Modal';
import { InternalThemeProvider } from '@/styledSystem';

import { CardRoot } from '../CardRoot';

let captured: ParsedAppearance;
const AppearanceCapture = () => {
  captured = useAppearance();
  return null;
};

const hasFlushShape = (elements: ParsedAppearance['parsedElements']) =>
  elements.some(el => el.cardBox?.boxShadow === 'none' && el.card?.backgroundColor === 'transparent');

type RenderCardOptions = {
  elevation?: 'raised' | 'flush';
  globalAppearance?: Record<string, unknown>;
  appearance?: Record<string, unknown>;
  withModal?: boolean;
};

const renderCard = ({ elevation, globalAppearance, appearance, withModal }: RenderCardOptions = {}) => {
  const card = (
    <CardRoot elevation={elevation}>
      <AppearanceCapture />
    </CardRoot>
  );

  return render(
    <AppearanceProvider
      appearanceKey='signIn'
      globalAppearance={globalAppearance as any}
      appearance={appearance as any}
    >
      <InternalThemeProvider>
        <FlowMetadataProvider flow='signIn'>
          {withModal ? <ModalContext.Provider value={{ value: {} }}>{card}</ModalContext.Provider> : card}
        </FlowMetadataProvider>
      </InternalThemeProvider>
    </AppearanceProvider>,
  );
};

describe('CardRoot augmentedAppearance — raised (default)', () => {
  beforeEach(() => {
    captured = undefined as any;
  });

  it('children see original parsedElements when elevation is raised', () => {
    renderCard();
    expect(hasFlushShape(captured.parsedElements)).toBe(false);
  });

  it('explicit raised prop overrides flush option', () => {
    renderCard({
      elevation: 'raised',
      appearance: { options: { elevation: 'flush' } },
    });
    expect(hasFlushShape(captured.parsedElements)).toBe(false);
  });
});

describe('CardRoot augmentedAppearance — flush', () => {
  beforeEach(() => {
    captured = undefined as any;
  });

  it('flush overrides appear at index 1 after base theme', () => {
    renderCard({ elevation: 'flush' });
    expect(captured.parsedElements[1].cardBox?.boxShadow).toBe('none');
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
    expect(captured.parsedElements[1].footer?.paddingTop).toBe(0);
  });

  it('preserves parsedInternalTheme, parsedOptions, and parsedCaptcha through augmentation', () => {
    renderCard({ elevation: 'raised' });
    const { parsedInternalTheme: raisedTheme, parsedOptions: raisedOptions, parsedCaptcha: raisedCaptcha } = captured;

    renderCard({ elevation: 'flush' });
    expect(captured.parsedInternalTheme).toEqual(raisedTheme);
    expect(captured.parsedOptions).toEqual(raisedOptions);
    expect(captured.parsedCaptcha).toEqual(raisedCaptcha);
  });

  it('parsedElements length increases by 1 when flush is active', () => {
    renderCard({ elevation: 'raised' });
    const raisedLength = captured.parsedElements.length;

    renderCard({ elevation: 'flush' });
    expect(captured.parsedElements.length).toBe(raisedLength + 1);
  });

  it('user appearance.elements.card appears after flush overrides', () => {
    renderCard({
      elevation: 'flush',
      appearance: { elements: { card: { backgroundColor: 'hotpink' } } },
    });
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
    expect(captured.parsedElements[2].card?.backgroundColor).toBe('hotpink');
  });

  it('globalAppearance.elements appear after flush overrides', () => {
    renderCard({
      elevation: 'flush',
      globalAppearance: { elements: { card: { backgroundColor: 'hotpink' } } },
    });
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
    expect(captured.parsedElements[2].card?.backgroundColor).toBe('hotpink');
  });

  it('both global and component element layers are preserved in order after flush', () => {
    renderCard({
      elevation: 'flush',
      globalAppearance: { elements: { card: { color: 'blue' } } },
      appearance: { elements: { card: { color: 'red' } } },
    });
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
    expect(captured.parsedElements[2].card?.color).toBe('blue');
    expect(captured.parsedElements[3].card?.color).toBe('red');
  });

  it('elevation via appearance.options activates flush', () => {
    renderCard({
      appearance: { options: { elevation: 'flush' } },
    });
    expect(captured.parsedElements[1].cardBox?.boxShadow).toBe('none');
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
  });

  it('user string classname elements are preserved after flush overrides', () => {
    renderCard({
      elevation: 'flush',
      appearance: { elements: { card: 'my-custom-class' } },
    });
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
    expect(captured.parsedElements[2].card).toBe('my-custom-class');
  });

  it('user footer overrides with nested selectors appear after flush footer', () => {
    renderCard({
      elevation: 'flush',
      appearance: {
        elements: {
          footer: {
            background: 'blue',
            '>:first-of-type': { padding: '16px' },
          },
        },
      },
    });
    expect(captured.parsedElements[1].footer?.background).toBe('transparent');
    expect(captured.parsedElements[1].footer?.['>:first-of-type']?.padding).toBe(0);
    expect(captured.parsedElements[2].footer?.background).toBe('blue');
    expect(captured.parsedElements[2].footer?.['>:first-of-type']?.padding).toBe('16px');
  });
});

describe('CardRoot elevation resolution priority', () => {
  beforeEach(() => {
    captured = undefined as any;
  });

  it('modal context forces raised even when option is flush', () => {
    renderCard({
      withModal: true,
      appearance: { options: { elevation: 'flush' } },
    });
    expect(hasFlushShape(captured.parsedElements)).toBe(false);
  });

  it('explicit flush prop overrides modal context', () => {
    renderCard({
      elevation: 'flush',
      withModal: true,
    });
    expect(captured.parsedElements[1].cardBox?.boxShadow).toBe('none');
    expect(captured.parsedElements[1].card?.backgroundColor).toBe('transparent');
  });
});

describe('CardRoot data-elevation attribute', () => {
  it('data-elevation is absent when raised', () => {
    const { container } = renderCard();
    expect(container.querySelector('[data-elevation]')).toBeNull();
  });

  it('data-elevation is flush when elevation is flush', () => {
    const { container } = renderCard({ elevation: 'flush' });
    expect(container.querySelector('[data-elevation="flush"]')).not.toBeNull();
  });

  it('data-elevation is absent when modal forces raised', () => {
    const { container } = renderCard({
      withModal: true,
      appearance: { options: { elevation: 'flush' } },
    });
    expect(container.querySelector('[data-elevation]')).toBeNull();
  });
});
