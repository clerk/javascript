import * as stylex from '@stylexjs/stylex';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { Field } from './field';
import { Heading } from './heading';
import { Icon } from './icon';
import { Input } from './input';
import { Item } from './item';
import { reset } from './reset.styles';
import { Settings } from './settings';
import { Text } from './text';

// StyleX generates the same atom for the same property+value across separate `create` calls, so a
// local probe names the atoms to assert on without hardcoding hashes that a StyleX upgrade rewrites.
const probe = stylex.create({
  borderBox: { boxSizing: 'border-box' },
  inheritedWeight: { fontWeight: 'inherit' },
});

const classes = (style: stylex.StyleXStyles) => (stylex.props(style).className ?? '').split(' ').filter(Boolean);
const atoms = (style: stylex.StyleXStyles) => classes(style).filter(name => !name.includes('__'));

// StyleX drops an atom once a component sets the same property, which is the whole point of the
// reset going first — so `margin`/`padding`/the `inherit` declarations cannot be asserted on every
// element. Two things do hold everywhere:
//   - `box-sizing`, the one property nothing overrides
//   - the `<file>__<key>` marker class, which survives every property-level override and is
//     therefore the actual proof that a component composed `reset.base` at all
const borderBoxAtom = atoms(probe.borderBox);
const resetMarker = classes(reset.base).filter(name => name.includes('__'));

// Every Mosaic element that carries its own styles. A new component is only covered once it is
// listed here — that omission is the failure this suite exists to catch.
const cases: Array<[string, React.ReactElement]> = [
  ['Avatar', <Avatar.Root key='avatar' />],
  ['Badge', <Badge key='badge'>Beta</Badge>],
  ['Button', <Button key='button'>Continue</Button>],
  ['Card', <Card.Root key='card' />],
  ['Card.Header', <Card.Header key='card-header' />],
  ['Card.Content', <Card.Content key='card-content' />],
  ['Card.Footer', <Card.Footer key='card-footer' />],
  ['Field.Root', <Field.Root key='field-root' />],
  ['Field.Label', <Field.Label key='field-label' />],
  ['Field.Description', <Field.Description key='field-description' />],
  ['Field.Error', <Field.Error key='field-error' />],
  ['Heading', <Heading key='heading'>Title</Heading>],
  [
    'Icon',
    <Icon
      key='icon'
      name='ellipsis'
    />,
  ],
  ['Input', <Input key='input' />],
  ['Item', <Item.Root key='item' />],
  ['Item.Group', <Item.Group key='item-group' />],
  ['Item.Separator', <Item.Separator key='item-separator' />],
  ['Settings', <Settings.Root key='settings' />],
  ['Settings.Title', <Settings.Title key='settings-title'>Account</Settings.Title>],
  ['Settings.Group', <Settings.Group key='settings-group' />],
  ['Settings.Row', <Settings.Row key='settings-row' />],
  ['Settings.Items', <Settings.Items key='settings-items' />],
  ['Settings.Item', <Settings.Item key='settings-item' />],
  ['Settings.Media', <Settings.Media key='settings-media' />],
  ['Settings.Content', <Settings.Content key='settings-content' />],
  ['Settings.Label', <Settings.Label key='settings-label' />],
  ['Settings.Description', <Settings.Description key='settings-description' />],
  ['Settings.Actions', <Settings.Actions key='settings-actions' />],
  ['Text', <Text key='text'>Body copy</Text>],
];

describe('Mosaic reset', () => {
  it('derives the classes it asserts on from the reset itself', () => {
    expect(borderBoxAtom).toHaveLength(1);
    expect(resetMarker).toHaveLength(1);
    expect(classes(reset.base)).toEqual(expect.arrayContaining([...borderBoxAtom, ...resetMarker]));
  });

  it.each(cases)('%s carries the reset on its root element', (_name, ui) => {
    const { container } = render(ui);
    const element = container.firstElementChild;

    expect(element).not.toBeNull();
    expect(element).toHaveClass(...resetMarker, ...borderBoxAtom);
  });

  it('lets a component win over the reset it composes first', () => {
    const { container } = render(<Heading>Title</Heading>);

    // `reset.base` sets `fontWeight: inherit`; `heading.styles` sets semibold after it, so StyleX
    // must have dropped the reset's atom. Order-dependent, which is why the reset always goes first.
    expect(container.firstElementChild).not.toHaveClass(...atoms(probe.inheritedWeight));
  });
});
