import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { colorVars } from '../../tokens.stylex';
import { Settings, settingsVars } from './settings';

describe('Settings', () => {
  it('aliases its background to the global background token', () => {
    expect(colorVars).toMatchObject({
      '--cl-color-background': 'var(--cl-color-background)',
    });
    expect(settingsVars).toMatchObject({
      '--cl-settings-background': 'var(--cl-settings-background)',
      '--cl-settings-items-gap': 'var(--cl-settings-items-gap)',
    });
  });

  it('renders an accessible settings section and every compound part', () => {
    render(
      <Settings.Root>
        <Settings.Title>Account</Settings.Title>
        <Settings.Group data-testid='group'>
          <Settings.Row data-testid='row'>
            <Settings.Item data-testid='item'>
              <Settings.Media
                size='lg'
                data-testid='media'
              >
                Icon
              </Settings.Media>
              <Settings.Content data-testid='content'>
                <Settings.Label data-testid='label'>Name</Settings.Label>
                <Settings.Description data-testid='description'>Shown throughout the application.</Settings.Description>
              </Settings.Content>
              <Settings.Actions data-testid='actions'>Control</Settings.Actions>
            </Settings.Item>
          </Settings.Row>
        </Settings.Group>
      </Settings.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account' })).toHaveClass('cl-settings');
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toHaveClass('cl-settings-title');
    expect(screen.getByTestId('group')).toHaveClass('cl-settings-group');
    expect(screen.getByTestId('row')).toHaveClass('cl-settings-row');
    expect(screen.getByTestId('item')).toHaveClass('cl-settings-item');
    expect(screen.getByTestId('media')).toHaveClass('cl-settings-media');
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('content')).toHaveClass('cl-settings-content');
    expect(screen.getByTestId('label')).toHaveClass('cl-settings-label');
    expect(screen.getByTestId('description')).toHaveClass('cl-settings-description');
    expect(screen.getByTestId('actions')).toHaveClass('cl-settings-actions');
  });

  it('supports an explicit accessible name', () => {
    render(
      <Settings.Root aria-label='Account preferences'>
        <Settings.Title>Account</Settings.Title>
        <Settings.Group />
      </Settings.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account preferences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toBeInTheDocument();
  });

  it('composes multiple items in one row', () => {
    render(
      <Settings.Root>
        <Settings.Title>Profile</Settings.Title>
        <Settings.Group>
          <Settings.Row>
            <Settings.Item>
              <Settings.Content>
                <Settings.Label>Email</Settings.Label>
              </Settings.Content>
              <Settings.Actions>Edit</Settings.Actions>
            </Settings.Item>
            <Settings.Items data-testid='items'>
              <Settings.Item data-testid='nested-item'>
                <Settings.Content data-testid='nested-content'>
                  <Settings.Description>ada@example.com</Settings.Description>
                </Settings.Content>
                <Settings.Actions>More</Settings.Actions>
              </Settings.Item>
            </Settings.Items>
          </Settings.Row>
        </Settings.Group>
      </Settings.Root>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getAllByText(/Edit|More/)).toHaveLength(2);
    expect(screen.getByTestId('items')).toHaveClass('cl-settings-items');
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
      <Settings.Root
        ref={rootRef}
        render={props => <article {...props} />}
        className='custom-root'
      >
        <Settings.Title>Account</Settings.Title>
        <Settings.Group
          ref={groupRef}
          className='custom-group'
          style={{ borderWidth: 2 }}
        >
          <Settings.Row>
            <Settings.Item
              ref={itemRef}
              style={{ minHeight: 80 }}
            >
              <Settings.Content ref={contentRef}>
                <Settings.Label style={{ color: 'red' }}>Name</Settings.Label>
              </Settings.Content>
              <Settings.Actions ref={actionsRef} />
            </Settings.Item>
          </Settings.Row>
        </Settings.Group>
      </Settings.Root>,
    );

    expect(rootRef.current?.tagName).toBe('ARTICLE');
    expect(rootRef.current).toHaveClass('cl-settings', 'custom-root');
    expect(groupRef.current).toHaveClass('cl-settings-group', 'custom-group');
    expect(groupRef.current).toHaveStyle({ borderWidth: '2px' });
    expect(itemRef.current).toHaveClass('cl-settings-item');
    expect(itemRef.current).toHaveStyle({ minHeight: '80px' });
    expect(contentRef.current).toHaveClass('cl-settings-content');
    expect(screen.getByText('Name')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(actionsRef.current).toHaveClass('cl-settings-actions');
  });
});
