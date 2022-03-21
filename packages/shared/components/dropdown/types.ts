export type DropdownOption =
  | {
      label: React.ReactNode;
      value: string;
      nativeOption?: React.ReactNode;
    }
  | string;

export type DropdownComparator = (term: string, currentOption: DropdownOption) => boolean;
