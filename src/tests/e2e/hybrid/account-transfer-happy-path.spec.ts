import { test, expect } from '@fixtures/app.fixture';
import { env } from '@utils/env';

test('Hybrid happy path - create account via curl/api, verify in UI, transfer in UI, validate balances in API', async ({homePage, accountsOverviewPage, transferFundsPage, authApi, customersApi, accountsApi,}) => {
    const transferAmount = 25;

    let customerId: number;
    let existingAccountId: number;
    let newCheckingAccountId: number;
    let sourceBeforeBalance: number;
    let targetBeforeBalance: number;

    await test.step('Login via API and get customer id', async () => {
        expect(env.apiUsername, 'API_USERNAME must be configured').toBeTruthy();
        expect(env.apiPassword, 'API_PASSWORD must be configured').toBeTruthy();

        const customer = await authApi.login(env.apiUsername, env.apiPassword);

        expect(customer.id, 'Expected customer id to be returned from login API').toBeTruthy();

        customerId = customer.id;
    });

    await test.step('Get existing account via API', async () => {
        const accounts = await customersApi.getCustomerAccounts(customerId);

        expect(accounts.length, 'Expected at least one existing account').toBeGreaterThan(0);

        existingAccountId = accounts[0].id;

        expect(existingAccountId, 'Expected existing account id to be defined').toBeTruthy();
    });

    await test.step('Create new checking account via CURL', async () => {
        const createdAccount = await accountsApi.createCheckingAccount(customerId, existingAccountId);

        expect(createdAccount.id, 'Expected newly created checking account id').toBeTruthy();
        expect(createdAccount.type, 'Expected created account type to be CHECKING').toBe('CHECKING');

        newCheckingAccountId = createdAccount.id;
    });

    await test.step('Login via UI with stable user', async () => {
        await homePage.open();
        await homePage.login(env.apiUsername, env.apiPassword);
        await accountsOverviewPage.waitForPageLoaded();
    });

    await test.step('Verify new account appears in UI', async () => {
        await accountsOverviewPage.assertAccountVisible(newCheckingAccountId);
    });

    await test.step('Read balances before transfer via API', async () => {
        const sourceAccount = await accountsApi.getAccount(existingAccountId);
        const targetAccount = await accountsApi.getAccount(newCheckingAccountId);

        sourceBeforeBalance = Number(sourceAccount.balance);
        targetBeforeBalance = Number(targetAccount.balance);

        expect(Number.isNaN(sourceBeforeBalance), 'Expected source balance to be numeric').toBeFalsy();
        expect(Number.isNaN(targetBeforeBalance), 'Expected target balance to be numeric').toBeFalsy();
    });

    await test.step('Transfer money between accounts via UI', async () => {
        await accountsOverviewPage.openTransferFunds();
        await transferFundsPage.waitForPageLoaded();

        await transferFundsPage.transferFunds(
            existingAccountId,
            newCheckingAccountId,
            transferAmount
        );

        await transferFundsPage.assertTransferSucceeded();
    });

    await test.step('Validate updated balances via API', async () => {
        const sourceAfter = await accountsApi.getAccount(existingAccountId);
        const targetAfter = await accountsApi.getAccount(newCheckingAccountId);

        expect(Number(sourceAfter.balance), `Expected source account ${existingAccountId} balance to decrease by ${transferAmount}`).toBe(sourceBeforeBalance - transferAmount);

        expect(Number(targetAfter.balance), `Expected target account ${newCheckingAccountId} balance to increase by ${transferAmount}`).toBe(targetBeforeBalance + transferAmount);
    });

    await test.step('Logout', async () => {
        await accountsOverviewPage.logout();
        await homePage.waitForPageLoaded();
    });
});