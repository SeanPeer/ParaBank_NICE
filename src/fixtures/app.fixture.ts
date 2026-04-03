import { test as base, expect } from '@playwright/test';
import { ApiClient } from '@api/client/api.client';
import { AuthApi } from '@api/services/auth.api';
import { CustomersApi } from '@api/services/customers.api';
import { AccountsApi } from '@api/services/accounts.api';
import { HomePage } from '@ui/pages/home.page';
import { RegisterPage } from '@ui/pages/register.page';
import { AccountsOverviewPage } from '@ui/pages/accounts-overview.page';
import { TransferFundsPage } from '@ui/pages/transfer-funds.page';
import { RegistrationFlow } from '@flows/registration.flow';
import { CurlClient } from '@api/client/curl.client';
import { LoginFlow } from '@flows/login.flow';
import { env } from '@utils/env';

type AppFixtures = {
    homePage: HomePage;
    registerPage: RegisterPage;
    accountsOverviewPage: AccountsOverviewPage;
    apiClient: ApiClient;
    authApi: AuthApi;
    customersApi: CustomersApi;
    accountsApi: AccountsApi;
    transferFundsPage: TransferFundsPage;
    registrationFlow: RegistrationFlow;
    curlClient: CurlClient;
    loginFlow: LoginFlow;
};

export const test = base.extend<AppFixtures>({
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },

    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },

    accountsOverviewPage: async ({ page }, use) => {
        await use(new AccountsOverviewPage(page));
    },

    apiClient: async ({ playwright }, use) => {
        const requestContext = await playwright.request.newContext({
            baseURL: env.apiBaseUrl,
        });

        await use(new ApiClient(requestContext));
        await requestContext.dispose();
    },

    authApi: async ({ apiClient }, use) => {
        await use(new AuthApi(apiClient));
    },

    customersApi: async ({ apiClient }, use) => {
        await use(new CustomersApi(apiClient));
    },


    transferFundsPage: async ({ page }, use) => {
        await use(new TransferFundsPage(page));
    },
    registrationFlow: async ({ registerPage }, use) => {
        await use(new RegistrationFlow(registerPage));
    },
    curlClient: async ({}, use) => {
        await use(new CurlClient());
    },

    accountsApi: async ({ apiClient, curlClient }, use) => {
        await use(new AccountsApi(apiClient, curlClient));
    },
    loginFlow: async ({ homePage }, use) => {
        await use(new LoginFlow(homePage));
    },

});

export { expect };