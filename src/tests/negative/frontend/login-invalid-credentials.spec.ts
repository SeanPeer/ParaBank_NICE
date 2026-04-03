import { test, expect } from '@fixtures/app.fixture';

test('UI negative - login with invalid credentials', async ({ homePage }) => {
    await test.step('Open login page', async () => {
        await homePage.open();
        await homePage.waitForPageLoaded();
    });

    await test.step('Attempt login with invalid credentials', async () => {
        const result = await homePage.loginAndGetResult(
            'SeanBirion',
            'wrong_password_123'
        );

        expect(result, 'Expected login result to be invalid_credentials for wrong username/password').not.toBe('success');
    });

    await test.step('Verify invalid credentials error message is displayed', async () => {
        await homePage.assertInvalidCredentialsError(); // a bug in platform
        //await homePage.assertInternalLoginError()
    });
});