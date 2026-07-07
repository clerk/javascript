import React from 'react';

import { descriptors, Icon, localizationKeys, useLocalizations } from '../customizables';
import type { ElementDescriptor } from '../customizables/elementDescriptors';
import { MagnifyingGlass } from '../icons';
import { Spinner } from '../primitives';
import type { PropsOfComponent } from '../styledSystem';
import { InputWithIcon } from './InputWithIcon';

type SearchInputProps = Omit<
  PropsOfComponent<typeof InputWithIcon>,
  'leftIcon' | 'type' | 'clearButtonElementDescriptor'
> & {
  /**
   * Called when the user clears the input. The parent is responsible for resetting `value`.
   */
  onClear: () => void;
  /**
   * Renders a spinner in place of the search icon, e.g. while results are loading.
   */
  isLoading?: boolean;
  /**
   * Descriptor for the leading search icon.
   */
  leftIconElementDescriptor?: ElementDescriptor;
};

/**
 * A search input preset: a magnifying-glass icon (or spinner while loading) and a trailing clear
 * button that all search inputs share. The clear button uses the single `searchInputClearButton`
 * appearance element and a shared clear label, so new search inputs don't introduce their own.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { isLoading, leftIconElementDescriptor, clearButtonLabel, ...rest },
  ref,
) {
  const { t } = useLocalizations();

  return (
    <InputWithIcon
      ref={ref}
      type='search'
      autoComplete='off'
      autoCapitalize='none'
      spellCheck={false}
      leftIcon={
        isLoading ? (
          <Spinner size='xs' />
        ) : (
          <Icon
            icon={MagnifyingGlass}
            elementDescriptor={leftIconElementDescriptor}
            sx={theme => ({ color: theme.colors.$colorMutedForeground })}
          />
        )
      }
      clearButtonLabel={clearButtonLabel ?? t(localizationKeys('searchInput.action__clear'))}
      clearButtonElementDescriptor={descriptors.searchInputClearButton}
      {...rest}
    />
  );
});
