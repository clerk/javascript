import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from '../components/input';
import { SettingsGroup } from './settings-group';

describe('SettingsGroup', () => {
  it('renders an accessible settings section and every compound part', () => {
    render(
      <SettingsGroup.Root>
        <SettingsGroup.Title>Account</SettingsGroup.Title>
        <SettingsGroup.List data-testid='list'>
          <SettingsGroup.Row data-testid='row'>
            <SettingsGroup.Media data-testid='media'>Icon</SettingsGroup.Media>
            <SettingsGroup.Label
              description='Shown throughout the application.'
              data-testid='label'
            >
              Name
            </SettingsGroup.Label>
            <SettingsGroup.Control data-testid='control'>Control</SettingsGroup.Control>
          </SettingsGroup.Row>
        </SettingsGroup.List>
      </SettingsGroup.Root>,
    );

    const section = screen.getByRole('region', { name: 'Account' });
    expect(section).toHaveClass('cl-settings-group');
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toHaveClass('cl-settings-group-title');
    expect(screen.getByTestId('list')).toHaveClass('cl-settings-group-list');
    expect(screen.getByTestId('row')).toHaveClass('cl-settings-group-row');
    expect(screen.getByTestId('media')).toHaveClass('cl-settings-group-media');
    expect(screen.getByTestId('label')).toHaveClass('cl-settings-group-label');
    expect(screen.getByTestId('label').tagName).toBe('DIV');
    expect(screen.getByText('Shown throughout the application.')).toHaveClass('cl-settings-group-label-description');
    expect(screen.getByTestId('control')).toHaveClass('cl-settings-group-control');
  });

  it('supports an explicit accessible name', () => {
    render(
      <SettingsGroup.Root aria-label='Account preferences'>
        <SettingsGroup.Title>Account</SettingsGroup.Title>
        <SettingsGroup.List />
      </SettingsGroup.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account preferences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Account' })).toBeInTheDocument();
  });

  it('automatically associates a field row label and control', () => {
    render(
      <SettingsGroup.Root>
        <SettingsGroup.Title>Account</SettingsGroup.Title>
        <SettingsGroup.List>
          <SettingsGroup.Row
            data-testid='row'
            field
          >
            <SettingsGroup.Label>Name</SettingsGroup.Label>
            <SettingsGroup.Control>
              <Input defaultValue='Ada Lovelace' />
            </SettingsGroup.Control>
          </SettingsGroup.Row>
        </SettingsGroup.List>
      </SettingsGroup.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(screen.getByTestId('row')).toHaveClass('cl-settings-group-row', 'cl-field-root');
    expect(screen.getByTestId('row')).toHaveAttribute('data-field');
    expect(input).toHaveValue('Ada Lovelace');
    expect(screen.getByText('Name').closest('label')).toHaveAttribute('for', input.id);
  });

  it('lets consumer className and style win on every part', () => {
    render(
      <SettingsGroup.Root
        className='custom-root'
        style={{ rowGap: 20 }}
      >
        <SettingsGroup.Title
          className='custom-title'
          style={{ color: 'blue' }}
        >
          Account
        </SettingsGroup.Title>
        <SettingsGroup.List
          className='custom-list'
          style={{ borderWidth: 2 }}
          data-testid='list'
        >
          <SettingsGroup.Row
            className='custom-row'
            style={{ minHeight: 80 }}
            data-testid='row'
          >
            <SettingsGroup.Label
              className='custom-label'
              style={{ color: 'red' }}
              data-testid='label'
            >
              Name
            </SettingsGroup.Label>
            <SettingsGroup.Control
              className='custom-control'
              style={{ width: 200 }}
              data-testid='control'
            />
          </SettingsGroup.Row>
        </SettingsGroup.List>
      </SettingsGroup.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account' })).toHaveClass('cl-settings-group', 'custom-root');
    expect(screen.getByRole('region', { name: 'Account' })).toHaveStyle({ rowGap: '20px' });
    expect(screen.getByRole('heading', { name: 'Account' })).toHaveClass('cl-settings-group-title', 'custom-title');
    expect(screen.getByRole('heading', { name: 'Account' })).toHaveStyle({ color: 'rgb(0, 0, 255)' });
    expect(screen.getByTestId('list')).toHaveClass('cl-settings-group-list', 'custom-list');
    expect(screen.getByTestId('list')).toHaveStyle({ borderWidth: '2px' });
    expect(screen.getByTestId('row')).toHaveClass('cl-settings-group-row', 'custom-row');
    expect(screen.getByTestId('row')).toHaveStyle({ minHeight: '80px' });
    expect(screen.getByTestId('label')).toHaveClass('cl-settings-group-label', 'custom-label');
    expect(screen.getByTestId('label')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(screen.getByTestId('control')).toHaveClass('cl-settings-group-control', 'custom-control');
    expect(screen.getByTestId('control')).toHaveStyle({ width: '200px' });
  });

  it('forwards refs, arbitrary props, and custom elements', () => {
    const rootRef = React.createRef<HTMLElement>();
    const titleRef = React.createRef<HTMLHeadingElement>();
    const listRef = React.createRef<HTMLDivElement>();
    const rowRef = React.createRef<HTMLDivElement>();
    const fieldRowRef = React.createRef<HTMLDivElement>();
    const mediaRef = React.createRef<HTMLDivElement>();
    const labelRef = React.createRef<HTMLDivElement>();
    const controlRef = React.createRef<HTMLDivElement>();

    render(
      <SettingsGroup.Root
        ref={rootRef}
        render={props => <article {...props} />}
      >
        <SettingsGroup.Title ref={titleRef}>Account</SettingsGroup.Title>
        <SettingsGroup.List
          ref={listRef}
          aria-label='Settings'
        >
          <SettingsGroup.Row ref={rowRef}>
            <SettingsGroup.Media ref={mediaRef}>Icon</SettingsGroup.Media>
            <SettingsGroup.Label ref={labelRef}>Name</SettingsGroup.Label>
            <SettingsGroup.Control ref={controlRef} />
          </SettingsGroup.Row>
          <SettingsGroup.Row
            ref={fieldRowRef}
            field
          >
            <SettingsGroup.Label>Username</SettingsGroup.Label>
            <SettingsGroup.Control>
              <Input />
            </SettingsGroup.Control>
          </SettingsGroup.Row>
        </SettingsGroup.List>
      </SettingsGroup.Root>,
    );

    expect(rootRef.current?.tagName).toBe('ARTICLE');
    expect(rootRef.current).toHaveClass('cl-settings-group');
    expect(titleRef.current?.tagName).toBe('H4');
    expect(titleRef.current).toHaveClass('cl-settings-group-title');
    expect(listRef.current).toBe(screen.getByLabelText('Settings'));
    expect(rowRef.current).toHaveClass('cl-settings-group-row');
    expect(fieldRowRef.current).toHaveClass('cl-settings-group-row', 'cl-field-root');
    expect(fieldRowRef.current).toHaveAttribute('data-field');
    expect(mediaRef.current).toHaveClass('cl-settings-group-media');
    expect(labelRef.current).toHaveClass('cl-settings-group-label');
    expect(controlRef.current).toHaveClass('cl-settings-group-control');
  });
});
