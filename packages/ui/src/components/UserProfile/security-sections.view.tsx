import { DeleteSection } from './DeleteSection';
import { MfaSection } from './MfaSection';
import { PasskeySection } from './PasskeySection';
import { PasswordSection } from './PasswordSection';

export const SecurityPasswordView = () => <PasswordSection />;
export const SecurityPasskeysView = () => <PasskeySection />;
export const SecurityMfaView = () => <MfaSection />;
export const SecurityDeleteView = () => <DeleteSection />;
