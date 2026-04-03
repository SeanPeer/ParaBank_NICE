import { test } from '@fixtures/app.fixture';
import { UserFactory } from '@utils/user.factory';

test('UI negative - register with existing username', async ({
                                                                 homePage,
                                                                 registerPage
                                                             }) => {
    const existingUsername = 'john';

    const user = {
        ...UserFactory.create(),
        username: existingUsername,
    };

    await test.step('Open register page', async () => {
        await homePage.open();
        await homePage.clickRegister();
    });

    await test.step('Submit registration with an existing username', async () => {
        await registerPage.register(user);
    });

    await test.step('Verify existing username validation message is displayed', async () => {
        await registerPage.assertUsernameAlreadyExistsError();
    });
});