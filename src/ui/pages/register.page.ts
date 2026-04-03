import { expect, Page } from '@playwright/test';
import { BasePage } from '@ui/pages/base.page';

export interface RegisterUserData {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    ssn: string;
    username: string;
    password: string;
}

export type RegistrationSubmitResult =
    | 'success'
    | 'username_exists'
    | 'transient_error';

const REGISTRATION_SUCCESS_MESSAGE =
    'Your account was created successfully. You are now logged in.';

const USERNAME_ALREADY_EXISTS_MESSAGE = 'This username already exists.';

export class RegisterPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private get firstNameInput() {
        return this.page.locator('input[id="customer.firstName"]');
    }

    private get lastNameInput() {
        return this.page.locator('input[id="customer.lastName"]');
    }

    private get addressInput() {
        return this.page.locator('input[id="customer.address.street"]');
    }

    private get cityInput() {
        return this.page.locator('input[id="customer.address.city"]');
    }

    private get stateInput() {
        return this.page.locator('input[id="customer.address.state"]');
    }

    private get zipCodeInput() {
        return this.page.locator('input[id="customer.address.zipCode"]');
    }

    private get phoneInput() {
        return this.page.locator('input[id="customer.phoneNumber"]');
    }

    private get ssnInput() {
        return this.page.locator('input[id="customer.ssn"]');
    }

    private get usernameInput() {
        return this.page.locator('input[id="customer.username"]');
    }

    private get passwordInput() {
        return this.page.locator('input[id="customer.password"]');
    }

    private get confirmPasswordInput() {
        return this.page.locator('input[id="repeatedPassword"]');
    }

    private get registerButton() {
        return this.page.locator('input[value="Register"]');
    }

    private get successMessage() {
        return this.page.locator('#rightPanel p');
    }

    private get usernameAlreadyExistsError() {
        return this.page.locator('#customer\\.username\\.errors');
    }

    private get transientRegistrationError() {
        return this.page.locator('#rightPanel .error');
    }

    async waitForPageLoaded(): Promise<void> {
        await super.waitForPageLoaded();
        await expect(this.firstNameInput).toBeVisible();
        await expect(this.registerButton).toBeVisible();
    }

    async fillRegistrationForm(user: RegisterUserData): Promise<void> {
        await this.firstNameInput.fill(user.firstName);
        await this.lastNameInput.fill(user.lastName);
        await this.addressInput.fill(user.address);
        await this.cityInput.fill(user.city);
        await this.stateInput.fill(user.state);
        await this.zipCodeInput.fill(user.zipCode);
        await this.phoneInput.fill(user.phone);
        await this.ssnInput.fill(user.ssn);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
    }

    async submit(): Promise<void> {
        await this.registerButton.click();
    }

    async register(user: RegisterUserData): Promise<void> {
        await this.fillRegistrationForm(user);
        await this.submit();
    }

    async assertRegistrationSucceeded(): Promise<void> {
        await expect(this.successMessage).toHaveText(REGISTRATION_SUCCESS_MESSAGE);
    }

    async waitForSubmissionResult(timeout = 10000): Promise<RegistrationSubmitResult> {
        const successPromise = this.successMessage
            .filter({ hasText: REGISTRATION_SUCCESS_MESSAGE })
            .waitFor({ state: 'visible', timeout })
            .then(() => 'success' as const)
            .catch(() => null);

        const usernameExistsPromise = this.usernameAlreadyExistsError
            .filter({ hasText: USERNAME_ALREADY_EXISTS_MESSAGE })
            .waitFor({ state: 'visible', timeout })
            .then(() => 'username_exists' as const)
            .catch(() => null);

        const transientErrorPromise = this.transientRegistrationError
            .waitFor({ state: 'visible', timeout })
            .then(() => 'transient_error' as const)
            .catch(() => null);

        const result = await Promise.race([
            successPromise,
            usernameExistsPromise,
            transientErrorPromise,
        ]);

        if (!result) {
            throw new Error(
                'Registration submission finished without detecting success, username-exists, or transient error state.'
            );
        }

        return result;
    }

    async assertUsernameAlreadyExistsError(): Promise<void> {
        await expect(this.usernameAlreadyExistsError).toBeVisible();
        await expect(this.usernameAlreadyExistsError).toHaveText(
            USERNAME_ALREADY_EXISTS_MESSAGE
        );
    }

    async submitAndGetResult(user: RegisterUserData): Promise<RegistrationSubmitResult> {
        await this.register(user);
        return this.waitForSubmissionResult();
    }
}