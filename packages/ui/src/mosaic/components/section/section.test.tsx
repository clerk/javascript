import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Section } from './section';

describe('Section', () => {
  it('renders an accessible section and every compound part', () => {
    render(
      <Section.Root>
        <Section.Title>Account</Section.Title>
        <Section.Group data-testid='group'>
          <Section.Row data-testid='row'>
            <Section.Item data-testid='item'>
              <Section.Media
                size='lg'
                data-testid='media'
              >
                Icon
              </Section.Media>
              <Section.Content data-testid='content'>
                <Section.Label data-testid='label'>Name</Section.Label>
                <Section.Description data-testid='description'>Shown throughout the application.</Section.Description>
              </Section.Content>
              <Section.Actions data-testid='actions'>Control</Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account' })).toHaveClass('cl-section');
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toHaveClass('cl-section-title');
    expect(screen.getByTestId('group')).toHaveClass('cl-section-group');
    expect(screen.getByTestId('row')).toHaveClass('cl-section-row');
    expect(screen.getByTestId('item')).toHaveClass('cl-section-item');
    expect(screen.getByTestId('media')).toHaveClass('cl-section-media');
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('content')).toHaveClass('cl-section-content');
    expect(screen.getByTestId('label')).toHaveClass('cl-section-label');
    expect(screen.getByTestId('description')).toHaveClass('cl-section-description');
    expect(screen.getByTestId('actions')).toHaveClass('cl-section-actions');
  });

  it('supports an explicit accessible name', () => {
    render(
      <Section.Root aria-label='Account preferences'>
        <Section.Title>Account</Section.Title>
        <Section.Group />
      </Section.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account preferences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toBeInTheDocument();
  });

  it('composes multiple items in one row', () => {
    render(
      <Section.Root>
        <Section.Title>Profile</Section.Title>
        <Section.Group>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Email</Section.Label>
              </Section.Content>
              <Section.Actions>Edit</Section.Actions>
            </Section.Item>
            <Section.Items data-testid='items'>
              <Section.Item data-testid='nested-item'>
                <Section.Content data-testid='nested-content'>
                  <Section.Description>ada@example.com</Section.Description>
                </Section.Content>
                <Section.Actions>More</Section.Actions>
              </Section.Item>
            </Section.Items>
          </Section.Row>
        </Section.Group>
      </Section.Root>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getAllByText(/Edit|More/)).toHaveLength(2);
    expect(screen.getByTestId('items')).toHaveClass('cl-section-items');
    expect(screen.getByTestId('items')).toHaveAttribute('data-nested');
    expect(screen.getByTestId('nested-item')).toHaveAttribute('data-nested');
    expect(screen.getByTestId('nested-content')).toHaveAttribute('data-nested');
  });

  it('lets consumer props win and forwards refs and custom elements', () => {
    const rootRef = React.createRef<HTMLElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const actionsRef = React.createRef<HTMLDivElement>();

    render(
      <Section.Root
        ref={rootRef}
        render={props => <article {...props} />}
        className='custom-root'
      >
        <Section.Title>Account</Section.Title>
        <Section.Group
          ref={groupRef}
          className='custom-group'
          style={{ borderWidth: 2 }}
        >
          <Section.Row>
            <Section.Item
              ref={itemRef}
              style={{ minHeight: 80 }}
            >
              <Section.Content ref={contentRef}>
                <Section.Label style={{ color: 'red' }}>Name</Section.Label>
              </Section.Content>
              <Section.Actions ref={actionsRef} />
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>,
    );

    expect(rootRef.current?.tagName).toBe('ARTICLE');
    expect(rootRef.current).toHaveClass('cl-section', 'custom-root');
    expect(groupRef.current).toHaveClass('cl-section-group', 'custom-group');
    expect(groupRef.current).toHaveStyle({ borderWidth: '2px' });
    expect(itemRef.current).toHaveClass('cl-section-item');
    expect(itemRef.current).toHaveStyle({ minHeight: '80px' });
    expect(contentRef.current).toHaveClass('cl-section-content');
    expect(screen.getByText('Name')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(actionsRef.current).toHaveClass('cl-section-actions');
  });
});
