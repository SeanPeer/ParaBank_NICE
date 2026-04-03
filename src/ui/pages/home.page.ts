import { expect, Page } from '@playwright/test';
import { BasePage } from '@ui/pages/base.page';

export type LoginResult =
    | 'success'
    | 'invalid_credentials'
    | 'error';

const INVALID_CREDENTIALS_MESSAGE =
    'The username and password could not be verified.';

const INTERNAL_ERROR_MESSAGE =
    'An internal error has occurred and has been logged.';

export class HomePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private get loginPanel() {
        return this.page.locator('#loginPanel');
    }

    private get registerButton() {
        return this.loginPanel.getByText('Register');
    }

    private get loginButton() {
        return this.loginPanel.locator('input[value="Log In"]');
    }

    private get userNameInput() {
        return this.loginPanel.locator('input[name="username"]');
    }

    private get passwordInput() {
        return this.loginPanel.locator('input[name="password"]');
    }

    private get accountsOverviewTitle() {
        return this.page.getByRole('heading', { name: /accounts overview/i });
    }

    private get invalidCredentialsError() {
        return this.page.locator('#rightPanel').locator('.error')
    }

    private get internalLoginError() {
        return this.page.locator('#rightPanel .error').filter({
            hasText: INTERNAL_ERROR_MESSAGE,
        });
    }

    async waitForPageLoaded(): Promise<void> {
        await super.waitForPageLoaded();
        await expect(this.loginPanel).toBeVisible();
        await expect(this.userNameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
        await expect(this.registerButton).toBeVisible();
    }

    async open(): Promise<void> {
        await this.goto('/');
    }

    async clickRegister(): Promise<void> {
        await this.registerButton.click();
    }

    async fillLoginForm(username: string, password: string): Promise<void> {
        await this.userNameInput.fill(username);
        await this.passwordInput.fill(password);
    }

    async submitLogin(): Promise<void> {
        await this.loginButton.click();
    }

    async login(username: string, password: string): Promise<void> {
        await this.fillLoginForm(username, password);
        await this.submitLogin();
    }

    async waitForLoginResult(timeout = 10000): Promise<LoginResult> {
        const successPromise = this.accountsOverviewTitle
            .waitFor({ state: 'visible', timeout })
            .then(() => 'success' as const)
            .catch(() => null);

        const invalidCredentialsPromise = this.invalidCredentialsError
            .waitFor({ state: 'visible', timeout })
            .then(() => 'invalid_credentials' as const)
            .catch(() => null);

        const internalErrorPromise = this.internalLoginError
            .waitFor({ state: 'visible', timeout })
            .then(() => 'error' as const)
            .catch(() => null);

        const result = await Promise.race([
            successPromise,
            invalidCredentialsPromise,
            internalErrorPromise,
        ]);

        if (!result) {
            throw new Error('Login finished without detecting success, invalid credentials, or internal error state.');
        }

        return result;
    }

    async loginAndGetResult(
        username: string,
        password: string
    ): Promise<LoginResult> {
        await this.fillLoginForm(username, password);
        await this.submitLogin();
        return this.waitForLoginResult();
    }

    async assertInternalLoginError(): Promise<void> {
        await expect(this.internalLoginError).toHaveText(INTERNAL_ERROR_MESSAGE);
    }

    async assertInvalidCredentialsError(): Promise<void> {
        await expect(this.invalidCredentialsError,'Wrong Error is displayed !').toHaveText(INVALID_CREDENTIALS_MESSAGE);
    }
}