import React from 'react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@/test/utils';

import { sanitizeDomProps } from '../sanitizeDomProps';

// Mock component that captures props to verify what gets passed through
const TestComponent = React.forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => {
  // Extract data-testid to prevent it from overwriting our test id and exclude it from tracking
  const { 'data-testid': _, ...propsToTrack } = props;
  // Store props on the element's dataset for inspection
  return (
    <div
      ref={ref}
      {...props}
      data-testid='test-component'
      data-props={JSON.stringify(Object.keys(propsToTrack).sort())}
    />
  );
});
TestComponent.displayName = 'TestComponent';

describe('sanitizeDomProps', () => {
  it('filters out elementId prop', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    render(
      <SanitizedComponent
        elementId='test-id'
        data-testid='wrapper'
      />,
    );

    const element = screen.getByTestId('test-component');
    const props = JSON.parse(element.getAttribute('data-props') || '[]');

    expect(props).not.toContain('elementId');
    expect(element).not.toHaveAttribute('elementId');
  });

  it('filters out elementDescriptor prop', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    render(
      <SanitizedComponent
        elementDescriptor={{ id: 'test' }}
        data-testid='wrapper'
      />,
    );

    const element = screen.getByTestId('test-component');
    const props = JSON.parse(element.getAttribute('data-props') || '[]');

    expect(props).not.toContain('elementDescriptor');
    expect(element).not.toHaveAttribute('elementDescriptor');
  });

  it('filters out localizationKey prop', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    render(
      <SanitizedComponent
        localizationKey='test.key'
        data-testid='wrapper'
      />,
    );

    const element = screen.getByTestId('test-component');
    const props = JSON.parse(element.getAttribute('data-props') || '[]');

    expect(props).not.toContain('localizationKey');
    expect(element).not.toHaveAttribute('localizationKey');
  });

  it('filters out getContainer prop', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    const getContainer = () => document.body;

    render(
      <SanitizedComponent
        getContainer={getContainer}
        data-testid='wrapper'
      />,
    );

    const element = screen.getByTestId('test-component');
    const props = JSON.parse(element.getAttribute('data-props') || '[]');

    expect(props).not.toContain('getContainer');
    expect(element).not.toHaveAttribute('getContainer');
  });

  it('filters out all non-DOM props at once', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    const getContainer = () => document.body;

    render(
      <SanitizedComponent
        elementId='test-element-id'
        elementDescriptor={{ id: 'test' }}
        localizationKey='test.key'
        getContainer={getContainer}
        className='test-class'
        id='dom-id'
        data-testid='wrapper'
      />,
    );

    const element = screen.getByTestId('test-component');
    const props = JSON.parse(element.getAttribute('data-props') || '[]');

    // Should not contain filtered props
    expect(props).not.toContain('elementId');
    expect(props).not.toContain('elementDescriptor');
    expect(props).not.toContain('localizationKey');
    expect(props).not.toContain('getContainer');

    // Should contain valid DOM props (data-testid is excluded from tracking to preserve test id)
    expect(props).toContain('className');
    expect(props).toContain('id');

    // Verify attributes on DOM element
    expect(element).not.toHaveAttribute('elementId');
    expect(element).not.toHaveAttribute('elementDescriptor');
    expect(element).not.toHaveAttribute('localizationKey');
    expect(element).not.toHaveAttribute('getContainer');
    expect(element).toHaveClass('test-class');
    expect(element).toHaveAttribute('id', 'dom-id');
    expect(element).toHaveAttribute('data-testid', 'test-component');
  });

  it('passes through valid DOM props', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);

    render(
      <SanitizedComponent
        className='my-class'
        id='my-id'
        style={{ color: 'red' }}
        data-custom='custom-value'
        aria-label='test label'
        onClick={() => {}}
      />,
    );

    const element = screen.getByTestId('test-component');

    expect(element).toHaveClass('my-class');
    expect(element).toHaveAttribute('id', 'my-id');
    expect(element).toHaveAttribute('style');
    expect(element).toHaveAttribute('data-custom', 'custom-value');
    expect(element).toHaveAttribute('aria-label', 'test label');
    expect(element).toHaveProperty('onclick');
  });

  it('preserves ref forwarding', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    const ref = React.createRef<HTMLDivElement>();

    render(<SanitizedComponent ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId('test-component'));
  });

  it('handles getContainer function prop without errors', () => {
    const SanitizedComponent = sanitizeDomProps(TestComponent);
    const container = document.createElement('div');
    const getContainer = () => container;

    // Should not throw or cause React warnings
    expect(() => {
      render(<SanitizedComponent getContainer={getContainer} />);
    }).not.toThrow();

    const element = screen.getByTestId('test-component');
    expect(element).not.toHaveAttribute('getContainer');
  });
});
