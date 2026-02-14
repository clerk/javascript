import type {
  CodeToCountryIsoMapType,
  CountryEntry,
  CountryIso,
  IsoToCountryMapType,
} from './countryCodeData';

// Hardcoded US fallback for use before data loads
export const US_FALLBACK_ENTRY: CountryEntry = {
  name: 'United States' as CountryEntry['name'],
  iso: 'us' as CountryIso,
  code: '1' as CountryEntry['code'],
  pattern: '(...) ...-....' as CountryEntry['pattern'],
  priority: 100,
};

// Module-level cache
let isoToCountryMap: IsoToCountryMapType | undefined;
let codeToCountriesMap: CodeToCountryIsoMapType | undefined;
let subAreaCodeSets: { us: ReadonlySet<string>; ca: ReadonlySet<string> } | undefined;
let loadPromise: Promise<void> | undefined;

export function loadCountryCodeData(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import(/* webpackChunkName: "phone-country-data" */ './countryCodeData').then(mod => {
      isoToCountryMap = mod.IsoToCountryMap;
      codeToCountriesMap = mod.CodeToCountriesMap;
      subAreaCodeSets = mod.SubAreaCodeSets;
    });
  }
  return loadPromise;
}

export function isCountryCodeDataLoaded(): boolean {
  return isoToCountryMap !== undefined;
}

export function getIsoToCountryMap(): IsoToCountryMapType | undefined {
  return isoToCountryMap;
}

export function getCodeToCountriesMap(): CodeToCountryIsoMapType | undefined {
  return codeToCountriesMap;
}

export function getSubAreaCodeSets() {
  return subAreaCodeSets;
}

export type { CountryEntry, CountryIso, IsoToCountryMapType, CodeToCountryIsoMapType };
export type { CountryName, DialingCode, PhonePattern } from './countryCodeData';
