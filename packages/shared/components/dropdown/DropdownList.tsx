import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './DropdownList.module.scss';
import type { DropdownOption } from './types';
import { getOptionLabel } from './util';

const NoResultsItem = () => <li className={cn(styles.item, styles.noResults)}>No matches found</li>;

export type DropdownListProps = {
  dropdownRef: React.RefObject<HTMLUListElement>;
  selectionRef: React.RefObject<HTMLLIElement>;
  listClassName?: string;
  options: DropdownOption[];
  handleListSelection: (selectedOption: DropdownOption) => void;
  selectedIndex: number;
  listId?: string;
};

export function DropdownList({
  dropdownRef,
  selectionRef,
  listClassName,
  options,
  handleListSelection,
  selectedIndex,
  listId,
}: DropdownListProps): JSX.Element {
  return (
    <ul
      ref={dropdownRef}
      className={cn(styles.itemList, listClassName)}
      role='listbox'
      id={listId}
      tabIndex={-1}
    >
      {options.length ? (
        options.map((option, index) => (
          <li
            key={index}
            ref={index === selectedIndex ? selectionRef : null}
            aria-selected={index === selectedIndex}
            role='option'
            className={cn(styles.item, {
              [styles.selected]: index === selectedIndex,
            })}
            onMouseDown={e => {
              e.preventDefault();
              handleListSelection(option);
            }}
          >
            {getOptionLabel(option)}
          </li>
        ))
      ) : (
        <NoResultsItem />
      )}
    </ul>
  );
}
