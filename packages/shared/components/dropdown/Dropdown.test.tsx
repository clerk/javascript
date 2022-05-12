import { act, fireEvent, render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import * as React from 'react';

import { Dropdown } from './Dropdown';
import { DropdownComparator, DropdownOption } from './types';

describe('<Dropdown/>', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = function () {
      //
    };
  });

  const options = [
    { label: 'Foo', value: 'foo' },
    { label: 'Bar', value: 'bar' },
    { label: 'Qux', value: 'qux' },
  ];

  it('renders the inactive dropdown', () => {
    const onChange = jest.fn();

    const tree = renderJSON(
      <Dropdown
        options={options}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders the active dropdown', () => {
    const onChange = jest.fn();

    const tree = renderJSON(
      <Dropdown
        active
        defaultSelectedIndex={1}
        options={options}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('shows placeholder whenever selectedOption is not found', () => {
    const tree = renderJSON(
      <Dropdown
        name='opt'
        options={options}
        placeholder='Select...'
        selectedOption={'invalid'}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('does not show caret if showCaret is set to false', () => {
    const onChange = jest.fn();

    const tree = renderJSON(
      <Dropdown
        options={options}
        placeholder='Select...'
        handleChange={onChange}
        showCaret={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('selects an option upon clicking on it', () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name='opt'
        options={options}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    let trigger = screen.getByText('Select...');
    fireEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();

    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();

    const barOption = screen.getByText('Bar');
    expect(barOption).toBeInTheDocument();
    fireEvent.mouseDown(barOption);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'opt',
      value: 'bar',
      type: 'dropdown',
    });

    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();

    trigger = screen.getByText('Bar');
    fireEvent.click(trigger);

    const fooOption = screen.getByText('Foo');
    expect(fooOption).toBeInTheDocument();
    fireEvent.mouseDown(fooOption);

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith({
      name: 'opt',
      value: 'foo',
      type: 'dropdown',
    });

    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.queryByText('Bar')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();
  });

  it('selects an option upon selecting it with the keyboard', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name='opt'
        options={options}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    const trigger = screen.getAllByRole('button')[0];
    await userEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();

    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();

    const fooOption = screen.getByText('Bar');
    expect(fooOption).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'opt',
      value: 'foo',
      type: 'dropdown',
    });

    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.queryByText('Bar')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();
  });

  it('selects the last option using ArrowUp on the keyboard', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name='opt'
        options={options}
        placeholder='Select...'
        handleChange={onChange}
      />,
    );

    const trigger = screen.getAllByRole('button')[0];
    await userEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();

    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();

    const fooOption = screen.getByText('Bar');
    expect(fooOption).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      name: 'opt',
      value: 'qux',
      type: 'dropdown',
    });

    expect(screen.getByText('Qux')).toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Bar')).not.toBeInTheDocument();
  });
});

describe('Searchable <Dropdown />', () => {
  const options: DropdownOption[] = [
    { label: 'Foo', value: 'foo' },
    { label: 'Bar', value: 'bar' },
    { label: 'Qux', value: 'qux' },
    { label: 'Clerk', value: 'clerk' },
  ];

  it('renders searchable Dropdown', () => {
    const tree = renderJSON(
      <Dropdown
        options={options}
        searchable={true}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders tertiary Dropdown', () => {
    const tree = renderJSON(
      <Dropdown
        tertiary
        options={options}
        searchable={true}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders searchable Dropdown with native select element', () => {
    const withNativeOptions: DropdownOption[] = options.map(o =>
      typeof o === 'string'
        ? o
        : {
            ...o,
            nativeOption: (
              <option
                value={o.value}
                key={o.value}
              >
                {o.value}
              </option>
            ),
          },
    );
    const tree = renderJSON(
      <Dropdown
        options={withNativeOptions}
        searchable={true}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('list supplied options', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name={'opts'}
        handleChange={onChange}
        options={options}
        searchable={true}
      />,
    );

    const input = screen.getByRole('combobox');
    await act(async () => await userEvent.click(input));
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();
  });

  it('filters supplied options', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name={'opts'}
        handleChange={onChange}
        options={options}
        searchable={true}
      />,
    );

    const input = screen.getByRole('combobox');
    await act(async () => await userEvent.type(input, 'ba'));
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();
  });

  it('filters supplied options using the provided custom comparator', async () => {
    const onChange = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const customComparator = jest.fn(function (term, currentOption) {
      return typeof currentOption !== 'string' && currentOption.value === 'clerk';
    } as DropdownComparator);

    render(
      <Dropdown
        name={'opts'}
        handleChange={onChange}
        options={options}
        searchable={true}
        customComparator={customComparator}
      />,
    );

    const input = screen.getByRole('combobox');
    await act(async () => await userEvent.type(input, 'cle'));
    expect(screen.getByText('Clerk')).toBeInTheDocument();
    expect(screen.queryByText('Bar')).not.toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();
  });

  it('displays "No matching results" when results are not found', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name={'opts'}
        handleChange={onChange}
        options={options}
        searchable={true}
        active={true}
      />,
    );

    const input = screen.getByRole('combobox');
    await act(async () => await userEvent.type(input, 'random123'));
    expect(screen.getByText('No matches found')).toBeInTheDocument();
    expect(screen.queryByText('Bar')).not.toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Qux')).not.toBeInTheDocument();
  });

  xit('does not change selection without explicitly selecting an option', async () => {
    const onChange = jest.fn();

    render(
      <Dropdown
        name={'opts'}
        handleChange={onChange}
        options={options}
        searchable={true}
        selectedOption={'bar'}
      />,
    );

    const input = screen.getByRole('combobox');
    expect(screen.queryByText('Bar')).toBeInTheDocument();

    await userEvent.click(input);
    await act(async () => await userEvent.type(input, 'random'));
    fireEvent.blur(input);
    expect(screen.queryByText('Bar')).toBeInTheDocument();
  });
});
