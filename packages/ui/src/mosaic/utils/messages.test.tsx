import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fill, plural, rich } from './messages';

describe('fill', () => {
  it('substitutes every named placeholder', () => {
    expect(fill('Manage {value} for {name}', { value: 'a@b.c', name: 'Sam' })).toBe('Manage a@b.c for Sam');
  });

  it('accepts numbers', () => {
    expect(fill('Resend ({seconds})', { seconds: 9 })).toBe('Resend (9)');
  });

  it('leaves an unknown placeholder in place', () => {
    expect(fill('Hi {name}', {})).toBe('Hi {name}');
  });

  it('ignores inherited object properties', () => {
    expect(fill('{constructor}{toString}', {})).toBe('{constructor}{toString}');
  });
});

describe('plural', () => {
  const members = { one: '{count} member', other: '{count} members' };

  it('picks the form for the count and fills it', () => {
    expect(plural(members, 1)).toBe('1 member');
    expect(plural(members, 0)).toBe('0 members');
    expect(plural(members, 12)).toBe('12 members');
  });

  it('falls back to other when the locale category is not authored', () => {
    expect(plural({ other: '{count} items' }, 1)).toBe('1 items');
  });

  it('ignores inherited plural forms', () => {
    const forms = Object.assign(Object.create({ one: 'inherited' }), { other: '{count} items' });
    expect(plural(forms, 1)).toBe('1 items');
  });

  it('selects by locale', () => {
    const forms = { one: 'one', few: 'few', many: 'many', other: 'other' };
    expect(plural(forms, 3, 'pl')).toBe('few');
    expect(plural(forms, 5, 'pl')).toBe('many');
  });
});

describe('rich', () => {
  it('renders plain text and placeholders as text', () => {
    const { container } = render(<p>{rich('Hi {name}', { values: { name: 'Sam' } })}</p>);
    expect(container.innerHTML).toBe('<p>Hi Sam</p>');
  });

  it('renders an element passed as a value', () => {
    const { container } = render(<p>{rich('Resend ({seconds})', { values: { seconds: <span>9</span> } })}</p>);
    expect(container.innerHTML).toBe('<p>Resend (<span>9</span>)</p>');
  });

  it('renders markup through the matching component', () => {
    const { container } = render(
      <p>
        {rich('{#strong}{email}{/strong} will be removed.', {
          values: { email: 'a@b.c' },
          components: { strong: children => <strong>{children}</strong> },
        })}
      </p>,
    );
    expect(container.innerHTML).toBe('<p><strong>a@b.c</strong> will be removed.</p>');
  });

  it('nests markup', () => {
    const { container } = render(
      <p>
        {rich('Read the {#a}{#b}terms{/b} now{/a}', {
          components: { a: c => <a href='/terms'>{c}</a>, b: c => <b>{c}</b> },
        })}
      </p>,
    );
    expect(container.innerHTML).toBe('<p>Read the <a href="/terms"><b>terms</b> now</a></p>');
  });

  it('renders standalone markup', () => {
    const { container } = render(<p>{rich('Wait {#spinner/} please', { components: { spinner: () => <i /> } })}</p>);
    expect(container.innerHTML).toBe('<p>Wait <i></i> please</p>');
  });

  it('renders children inline when a component is missing', () => {
    const { container } = render(<p>{rich('See {#a}terms{/a}')}</p>);
    expect(container.innerHTML).toBe('<p>See terms</p>');
  });

  it('leaves an unknown placeholder in place', () => {
    const { container } = render(<p>{rich('Hi {name}!')}</p>);
    expect(container.innerHTML).toBe('<p>Hi {name}!</p>');
  });

  it('leaves an unmatched closing tag in place', () => {
    const { container } = render(<p>{rich('Use {/strong} literally', { components: {} })}</p>);
    expect(container.innerHTML).toBe('<p>Use {/strong} literally</p>');
  });

  it('ignores inherited object properties', () => {
    const { container } = render(
      <p>{rich('{#constructor}x{/constructor}{toString}', { values: {}, components: {} })}</p>,
    );
    expect(container.innerHTML).toBe('<p>x{toString}</p>');
  });

  it('never interprets values as markup', () => {
    const { container } = render(
      <p>{rich('Hi {name}', { values: { name: '<img src=x onerror=alert(1)>{#strong}x{/strong}' } })}</p>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe('Hi <img src=x onerror=alert(1)>{#strong}x{/strong}');
  });
});
