import { updateClerkOptions } from '@clerk/astro/client';
import { type ChangeEvent } from 'react';

export function LanguagePicker() {
  const onChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    let localization: any;

    if (value === 'fr') {
      localization = (await import('@clerk/localizations/fr-FR')).frFR;
    } else {
      localization = undefined;
    }

    updateClerkOptions({
      localization,
    });
  };
  return (
    <select
      className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
      onChange={onChange}
    >
      <option value='en'>English</option>
      <option value='fr'>French</option>
    </select>
  );
}
