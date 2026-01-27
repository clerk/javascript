export { setErrorThrowerOptions } from './errors/errorThrower';
export { MultisessionAppSupport } from './components/controlComponents';
export { useRoutingProps } from './hooks/useRoutingProps';
export { useDerivedAuth } from './hooks/useAuth';
export { IS_REACT_SHARED_VARIANT_COMPATIBLE } from './utils/versionCheck';

export {
  clerkJsScriptUrl,
  buildClerkJsScriptAttributes,
  clerkUiScriptUrl,
  buildClerkUiScriptAttributes,
  setClerkJsLoadingErrorPackageName,
} from '@clerk/shared/loadClerkJsScript';

export type { Ui } from '@clerk/ui/internal';
