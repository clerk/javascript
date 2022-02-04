import cn from 'classnames';
import React from 'react';

import { useDetectClickOutside } from '../../hooks';
import { ExpansionIcon } from '../expansionIcon';
// @ts-ignore
import styles from './Dropdown.module.scss';
import { DropdownList } from './DropdownList';
import type { DropdownComparator, DropdownOption } from './types';
import {
  defaultComparator,
  findSelectedOptionIndex,
  getOptionLabel,
  makeComparator,
} from './util';

const getNativeOption = (o: DropdownOption) => {
  if (typeof o === 'string') {
    return (
      <option value={o} key={'option-' + o}>
        {o}
      </option>
    );
  }
  return o.nativeOption;
};

export type DropdownSelection = {
  name: string;
  value: string;
  type: 'dropdown';
};

export type DropdownProps = {
  /** Should be unique to the attribute that is aiming to change. Translated to #id for the dropdown list */
  name?: string;
  options: DropdownOption[];
  selectedOption?: string;
  selectedOptionClassname?: string;
  defaultSelectedIndex?: number;
  active?: boolean;
  Icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCaret?: boolean;
  style?: any;
  /** Enable input filtered dropdown list behaviour */
  searchable?: boolean;
  handleChange?: (el: DropdownSelection) => void;
  handleDropdownClosed?: () => void;
  /** Custom compare function for the list filtering */
  customComparator?: DropdownComparator;
  labelClassname?: string;
  tertiary?: boolean;
};

export function Dropdown({
  name,
  options = [],
  selectedOption,
  selectedOptionClassname,
  defaultSelectedIndex,
  active,
  Icon,
  placeholder,
  disabled,
  className,
  showCaret = true,
  style,
  searchable = false,
  handleChange,
  handleDropdownClosed,
  customComparator,
  labelClassname,
  tertiary = false,
}: DropdownProps): JSX.Element {
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const selectionRef = React.useRef<HTMLLIElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const nativeOptions = React.useMemo(
    () => options.map(getNativeOption).filter(o => o),
    [options],
  );

  const [selectedIndex, setSelectedIndex] = React.useState(() => {
    if (defaultSelectedIndex != null && defaultSelectedIndex >= 0) {
      return defaultSelectedIndex;
    }

    return options.findIndex(option => {
      const preSelectedOption =
        typeof option === 'string' ? option : option.value;
      return preSelectedOption === selectedOption;
    });
  });

  const [isActive, setIsActive] = useDetectClickOutside(dropdownRef, !!active);
  const [isSearchInputActive, setSearchInputActive] = useDetectClickOutside(
    searchInputRef,
    false,
  );
  const [searchValue, setSearchValue] = React.useState('');
  const displayLabel = getOptionLabel(options[selectedIndex], placeholder);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.currentTarget.value;
    setSearchValue(newSearchValue);
    setSelectedIndex(0);
  };

  const comparator = makeComparator(
    searchValue,
    customComparator || defaultComparator,
  );
  const filteredOptions = searchValue ? options.filter(comparator) : options;

  React.useEffect(() => {
    if (isActive || !handleDropdownClosed) {
      return;
    }
    handleDropdownClosed();
  }, [isActive]);

  React.useEffect(() => {
    if (
      name &&
      selectedIndex != null &&
      selectedIndex >= 0 &&
      options.length > 0 &&
      typeof handleChange === 'function'
    ) {
      const selectedOption = options[selectedIndex];
      const value =
        typeof selectedOption === 'string'
          ? selectedOption
          : selectedOption.value;

      handleChange({
        name,
        value,
        type: 'dropdown',
      });
    }
  }, [selectedIndex]);

  React.useLayoutEffect(() => {
    if (
      !isActive ||
      !selectionRef.current?.scrollIntoView ||
      selectedIndex == undefined
    ) {
      return;
    }
    selectionRef.current.scrollIntoView({ block: 'nearest' });
  }, [isActive, selectedIndex, searchValue]);

  const onTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsActive(false);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isActive) {
        setSelectedIndex((i = 0) =>
          i - 1 < 0 || i - 1 > filteredOptions.length
            ? filteredOptions.length - 1
            : i - 1,
        );
      } else {
        setIsActive(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isActive) {
        setSelectedIndex(i => ((i || 0) + 1) % filteredOptions.length);
      } else {
        setIsActive(true);
      }
      return;
    }

    if (e.key === 'Enter') {
      setSelectedIndex(i => {
        return i >= filteredOptions.length
          ? findSelectedOptionIndex(options, filteredOptions[0])
          : findSelectedOptionIndex(options, filteredOptions[selectedIndex]);
      });
      searchInputRef.current?.blur();
      setSearchInputActive(false);
      setSearchValue('');
      e.preventDefault();
      setIsActive(!isActive);
    }
  };

  const handleListSelection = (selectedOption: DropdownOption) => {
    searchInputRef.current?.blur();
    const selectedIndex = findSelectedOptionIndex(options, selectedOption);
    setSearchValue('');
    setSearchInputActive(false);
    setSelectedIndex(selectedIndex);
    setIsActive(false);
  };

  const onSearchInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchInputActive(true);
    searchInputRef.current?.focus();
    setIsActive(true);
  };

  const onSearchInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsActive(false);
    setSearchValue('');
    setSearchInputActive(false);
  };

  const onSearchInputClick: React.MouseEventHandler = e => {
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        styles.container,
        { [styles.disabled]: disabled },
        className,
      )}
      style={style}
      onKeyDown={onKeyDown}
      onBlur={() => isActive && setIsActive(false)}
    >
      {searchable ? (
        <div
          onFocus={onSearchInputFocus}
          tabIndex={0}
          className={cn(styles.trigger)}
          onClick={onSearchInputClick}
        >
          {Icon}
          <input
            className={cn(styles.searchInput)}
            ref={searchInputRef}
            value={searchValue}
            type='text'
            autoComplete='off'
            aria-haspopup='listbox'
            aria-autocomplete='list'
            aria-controls={name}
            role='combobox'
            aria-expanded={isSearchInputActive}
            tabIndex={0}
            onChange={handleSearchInput}
            onBlur={onSearchInputBlur}
            data-no-focus={true}
          />
          {!isSearchInputActive && (
            <span
              className={cn(
                styles.label,
                styles.searchDisplay,
                selectedOptionClassname,
                {
                  [styles.placeholder]: !options[selectedIndex],
                },
              )}
            >
              {displayLabel}
            </span>
          )}
          {showCaret && <ExpansionIcon isExpanded={isActive} />}
        </div>
      ) : (
        <button
          onClick={onTriggerClick}
          className={cn(styles.trigger, {
            [styles.active]: isActive,
            [styles.tertiary]: tertiary,
          })}
          aria-haspopup='true'
          aria-expanded={isActive}
          type='button'
        >
          {Icon}
          <span
            className={cn(styles.label, labelClassname, {
              [styles.placeholder]: !options[selectedIndex],
              [styles.labelTertiary]: tertiary,
            })}
          >
            {displayLabel}
          </span>
          {showCaret && <ExpansionIcon isExpanded={isActive} />}
        </button>
      )}
      {isActive && (
        <DropdownList
          dropdownRef={dropdownRef}
          selectionRef={selectionRef}
          options={filteredOptions}
          handleListSelection={handleListSelection}
          selectedIndex={selectedIndex}
          listId={name}
        />
      )}
      {nativeOptions.length > 0 && (
        <select
          name='native-dropdown-picker'
          className={styles.nativeSelect}
          onChange={e => setSelectedIndex(e.target.selectedIndex)}
        >
          {nativeOptions}
        </select>
      )}
    </div>
  );
}
