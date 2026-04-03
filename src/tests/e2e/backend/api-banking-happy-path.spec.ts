import { test, expect } from '@fixtures/app.fixture';
import { env } from '@utils/env';

test('API happy path - login, get accounts, create checking account, validate account', async ({authApi, customersApi, accountsApi,}) => {
    let customerId: number;
    let existingAccountId: number;
    let newCheckingAccountId: number;

    await test.step('Get Customer ID via login', async () => {
        expect(env.apiUsername, 'API_USERNAME must be configured').toBeTruthy();
        expect(env.apiPassword, 'API_PASSWORD must be configured').toBeTruthy();

        const customer = await authApi.login(env.apiUsername, env.apiPassword);

        expect(customer.id, 'Expected customer id to be returned from login API').toBeTruthy();

        customerId = customer.id;
    });

    await test.step('Get existing accounts via API', async () => {
        const accounts = await customersApi.getCustomerAccounts(customerId);

        expect(accounts.length, 'Expected at least one existing account').toBeGreaterThan(0);

        existingAccountId = accounts[0].id;

        expect(existingAccountId, 'Expected existing account id to be defined').toBeTruthy();
    });

    await test.step('Create new checking account via API', async () => {
        const createdAccount = await accountsApi.createCheckingAccount(customerId, existingAccountId);
        expect(createdAccount.id, 'Expected newly created checking account id to be returned').toBeTruthy();

        newCheckingAccountId = createdAccount.id;
    });
    await test.step('Create new checking account via CURL', async () => {
        const createdAccount = await accountsApi.createCheckingAccount(
            customerId,
            existingAccountId
        );

        expect(createdAccount.id, 'Expected newly created checking account id to be returned').toBeTruthy();
        expect(createdAccount.type, 'Expected created account type to be CHECKING').toBe('CHECKING');

        newCheckingAccountId = createdAccount.id;
    });


    await test.step('Validate created account via API', async () => {
        const createdAccount = await accountsApi.getAccount(newCheckingAccountId);

        expect(createdAccount.id, 'Expected fetched account id to match created account id').toBe(newCheckingAccountId);
        expect(Number(createdAccount.balance), 'Expected created account to have a numeric balance').not.toBeNaN();

        if (createdAccount.type !== undefined) {
            expect(createdAccount.type, 'Expected created account type to be CHECKING').toBe('CHECKING');}
    });
});