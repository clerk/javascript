import { useEnvironment, useCoreUser } from '../../contexts';
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

  const deleteUser = async () => {
    try {
      await user.delete();
      router.navigate(environment.displayConfig.homeUrl);
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
