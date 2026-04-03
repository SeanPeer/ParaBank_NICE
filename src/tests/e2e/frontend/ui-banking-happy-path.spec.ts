import { test, expect } from '@fixtures/app.fixture';
import { UserFactory } from '@utils/user.factory';

test('UI happy path - register, logout, login', async ({homePage, accountsOverviewPage, registrationFlow, registerPage,loginFlow}) => {
    const user = UserFactory.create();
    const transferAmount = 50;

    await test.step('Register new user via UI', async () => {
        await homePage.open();
        await homePage.clickRegister();

        await registerPage.waitForPageLoaded();
        return registrationFlow.registerUniqueUser();
    });
    await test.step('Logout after registration to validate explicit login step', async () => {
        await accountsOverviewPage.logout();
        await homePage.waitForPageLoaded();
    });

    await test.step('Login with newly created user', async () => {
        await loginFlow.loginWithRetry(user.username, user.password);
        await accountsOverviewPage.waitForPageLoaded();
    });

    await test.step('Verify logged-in user can see accounts overview', async () => {
        await accountsOverviewPage.waitForPageLoaded();
    });


    await test.step('Logout', async () => {
        await accountsOverviewPage.logout();
        await homePage.waitForPageLoaded();
    });
});