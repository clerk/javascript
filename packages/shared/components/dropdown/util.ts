import { DropdownComparator, DropdownOption } from './types';

export const getOptionLabel = (
  selectedOption: DropdownOption,
  placeholder = '',
) => {
  return typeof selectedOption === 'string'
    ? selectedOption
    : selectedOption?.label || placeholder;
};

export const findSelectedOptionIndex = (
  options: DropdownOption[],
  selectedOption: DropdownOption,
): number => {
  if (!options || options.length === 0 || !selectedOption) {
    return 0;
  }

  return options.findIndex(option => {
    const optionValue = typeof option === 'string' ? option : option.value;
    const selectedOptionValue =
      typeof selectedOption === 'string'
        ? selectedOption
        : selectedOption.value;
    return optionValue === selectedOptionValue;
  });
};

export const makeComparator =
  (term: string | undefined, comparatorFn: DropdownComparator) =>
  (option: DropdownOption) => {
    if (!term) {
      return () => true;
    }
    return comparatorFn(term, option);
  };

export const defaultComparator: DropdownComparator = (
  term,
  option,
): boolean => {
  if (!term || !option) {
    return true;
  }

  const valueToFilter = typeof option === 'string' ? option : option.value;
  return (valueToFilter || '')
    .toLowerCase()
    .includes((term || '').toLowerCase());
};
