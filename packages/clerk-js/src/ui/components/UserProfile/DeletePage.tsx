import { useEnvironment, useCoreUser, useCoreClerk } from '../../contexts';
import { localizationKeys, Text } from '../../customizables';
import { ContentPage, Form, FormButtons, useCardState, withCardStateProvider } from '../../elements';
import { handleError } from '../../utils';
import { UserProfileBreadcrumbs } from './UserProfileNavbar';
import { useRouter } from '../../router';

export const DeletePage = withCardStateProvider(() => {
  const card = useCardState();
  const environment = useEnvironment();
  const router = useRouter();
  const user = useCoreUser();
  const clerk = useCoreClerk();

  const deleteUser = async () => {
    try {
      await user.delete();
      if (clerk.client.activeSessions.length > 0) {
        await router.navigate(environment.displayConfig.afterSignOutOneUrl);
      } else {
        await router.navigate(environment.displayConfig.afterSignOutAllUrl);
      }
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <ContentPage
      headerTitle={localizationKeys('userProfile.deletePage.title')}
      Breadcrumbs={UserProfileBreadcrumbs}
    >
      <Form.Root onSubmit={deleteUser}>
        <Text localizationKey={localizationKeys('userProfile.deletePage.description')} />
        <FormButtons
          submitLabel={localizationKeys('userProfile.deletePage.confirm')}
          colorScheme='danger'
        />
      </Form.Root>
    </ContentPage>
  );
});
