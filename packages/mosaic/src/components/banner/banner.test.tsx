import * as stylex from '@stylexjs/stylex';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Banner } from './banner';

const overrides = stylex.create({
  root: { marginTop: '8px' },
  label: { fontWeight: 700 },
  description: { opacity: 0.8 },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

const COLORS = ['neutral', 'warning', 'negative'] as const;

describe('Mosaic Banner', () => {
  it('renders its label and description', () => {
    render(
      <Banner.Root>
        <Banner.Label>Info banner</Banner.Label>
        <Banner.Description>Here is a tip for how this should work</Banner.Description>
      </Banner.Root>,
    );
    expect(screen.getByText('Info banner')).toBeInTheDocument();
    expect(screen.getByText('Here is a tip for how this should work')).toBeInTheDocument();
  });

  it('applies the default color when none is passed', () => {
    render(
      <Banner.Root>
        <Banner.Label>Info banner</Banner.Label>
      </Banner.Root>,
    );
    expect(screen.getByText('Info banner').closest('.cl-banner-root')).toHaveAttribute('data-color', 'neutral');
  });

  it.each(COLORS)('reflects the %s color on every part', color => {
    const { container } = render(
      <Banner.Root color={color}>
        <Banner.Label>Label</Banner.Label>
        <Banner.Description>Description</Banner.Description>
      </Banner.Root>,
    );
    expect(container.querySelector('.cl-banner-root')).toHaveAttribute('data-color', color);
    expect(screen.getByText('Label')).toHaveClass('cl-banner-label');
    expect(screen.getByText('Label')).toHaveAttribute('data-color', color);
    expect(screen.getByText('Description')).toHaveClass('cl-banner-description');
    expect(screen.getByText('Description')).toHaveAttribute('data-color', color);
  });

  it('renders a decorative icon keyed to the color', () => {
    const { container, rerender } = render(
      <Banner.Root>
        <Banner.Label>Label</Banner.Label>
      </Banner.Root>,
    );
    const icon = container.querySelector('.cl-banner-root > .cl-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('cl-banner-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    rerender(
      <Banner.Root color='negative'>
        <Banner.Label>Label</Banner.Label>
      </Banner.Root>,
    );
    expect(container.querySelector('.cl-banner-root > .cl-icon')).toBeInTheDocument();
  });

  it('applies xstyle on every part', () => {
    const { container } = render(
      <Banner.Root xstyle={overrides.root}>
        <Banner.Label xstyle={overrides.label}>Label</Banner.Label>
        <Banner.Description xstyle={overrides.description}>Description</Banner.Description>
      </Banner.Root>,
    );
    expect(container.querySelector('.cl-banner-root')).toHaveClass('cl-banner-root', ...atoms(overrides.root));
    expect(screen.getByText('Label')).toHaveClass('cl-banner-label', ...atoms(overrides.label));
    expect(screen.getByText('Description')).toHaveClass('cl-banner-description', ...atoms(overrides.description));
  });

  it('merges a render-sourced className instead of clobbering its own', () => {
    render(
      <Banner.Root>
        <Banner.Label render={<Banner.Description />}>Label</Banner.Label>
      </Banner.Root>,
    );
    expect(screen.getByText('Label')).toHaveClass('cl-banner-label', 'cl-banner-description');
  });

  it('forwards arbitrary props and refs', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const labelRef = React.createRef<HTMLSpanElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();
    const { container } = render(
      <Banner.Root
        ref={rootRef}
        id='renewal'
        role='status'
      >
        <Banner.Label ref={labelRef}>Label</Banner.Label>
        <Banner.Description ref={descriptionRef}>Description</Banner.Description>
      </Banner.Root>,
    );
    expect(rootRef.current).toBe(container.querySelector('.cl-banner-root'));
    expect(rootRef.current).toHaveAttribute('id', 'renewal');
    expect(rootRef.current).toHaveAttribute('role', 'status');
    expect(labelRef.current).toBe(screen.getByText('Label'));
    expect(descriptionRef.current).toBe(screen.getByText('Description'));
  });

  it('renders custom elements via render, keeping the styling contract', () => {
    render(
      <Banner.Root
        color='warning'
        render={<section />}
      >
        <Banner.Label render={<h2 />}>Warning banner</Banner.Label>
        <Banner.Description render={<div />}>Your payment could not be processed.</Banner.Description>
      </Banner.Root>,
    );
    const label = screen.getByRole('heading', { name: 'Warning banner' });
    expect(label.tagName).toBe('H2');
    expect(label).toHaveClass('cl-banner-label');
    expect(label).toHaveAttribute('data-color', 'warning');
    const description = screen.getByText('Your payment could not be processed.');
    expect(description.tagName).toBe('DIV');
    expect(description).toHaveClass('cl-banner-description');
  });
});
