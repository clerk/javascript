import { ChangePassword } from '@clerk/mosaic/blocks/change-password';
import { Card } from '@clerk/mosaic/components/card';
import { useForm } from '@clerk/mosaic/components/form';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './change-password.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  status: 'stable',
  title: 'ChangePassword',
  source: 'packages/mosaic/src/blocks/change-password/change-password.tsx',
};

export function Default() {
  const form = useForm({
    initialValues: { newPassword: '', confirmPassword: '', signOutOfOtherSessions: true },
    fields: {
      confirmPassword: {
        validate: (confirmPassword, values) =>
          confirmPassword !== values.newPassword ? { type: 'error', message: 'Passwords don’t match.' } : undefined,
      },
    },
    onSubmit: () => Promise.resolve(),
  });
  const { newPassword } = form.values;

  return (
    <Card.Root>
      <Card.Content>
        <ChangePassword
          newPasswordLabel='New password'
          confirmPasswordLabel='Confirm password'
          signOutOfOtherSessionsLabel='Sign out of all other devices'
          signOutOfOtherSessionsDescription='It is recommended to sign out of all other devices which may have used your old password.'
          showPasswordLabel='Show password'
          hidePasswordLabel='Hide password'
          identifier='jane@acme.com'
          newPassword={form.register('newPassword')}
          confirmPassword={form.register('confirmPassword')}
          fields={form.fields}
          signOutOfOtherSessions={form.values.signOutOfOtherSessions}
          onSignOutOfOtherSessionsChange={checked => form.setValue('signOutOfOtherSessions', checked)}
          passwordFeedback={
            newPassword === ''
              ? undefined
              : newPassword.length < 8
                ? { type: 'info', message: 'Your password must contain 8 or more characters.' }
                : { type: 'success', message: 'Your password meets all the necessary requirements.' }
          }
          disabled={form.isSubmitting}
        />
      </Card.Content>
    </Card.Root>
  );
}
