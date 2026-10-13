import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileMfaSection } from '../user-profile-mfa-section';

export const phone = fapiPhoneNumber({
  id: 'phone_1',
  phone_number: '+15555550101',
  verification: fapiVerification('phone_code', { status: 'verified' }),
});

export function mfaEnvironment() {
  const environment = fapiEnvironment();
  environment.user_settings.attributes.authenticator_app.enabled = true;
  environment.user_settings.attributes.authenticator_app.used_for_second_factor = true;
  environment.user_settings.attributes.authenticator_app.second_factors = ['totp'];
  environment.user_settings.attributes.phone_number.enabled = true;
  environment.user_settings.attributes.phone_number.used_for_second_factor = true;
  environment.user_settings.attributes.phone_number.second_factors = ['phone_code'];
  environment.user_settings.attributes.backup_code.enabled = true;
  environment.user_settings.attributes.backup_code.used_for_second_factor = true;
  environment.user_settings.attributes.backup_code.second_factors = ['backup_code'];
  environment.user_settings.sign_in.second_factor.enabled = true;
  return environment;
}

export async function renderMfa(
  user = fapiUser({ id: 'user_1', phone_numbers: [phone] }),
  environment = mfaEnvironment(),
) {
  const fapi = serveFapi({ environment, client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
  await renderWithClerk(<UserProfileMfaSection />);
  return fapi;
}
