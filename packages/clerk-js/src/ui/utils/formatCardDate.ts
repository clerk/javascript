type FormatCardDateProps = {
  expMonth: number;
  expYear: number;
  locale: string;
  options?: Intl.DateTimeFormatOptions;
};

export const formatCardDate = ({
  expMonth,
  expYear,
  locale,
  options = { month: '2-digit', year: 'numeric' },
}: FormatCardDateProps): string => {
  const date = new Date(expYear, expMonth - 1);
  return date.toLocaleString(locale, options);
};
