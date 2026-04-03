import { HomePage } from '@ui/pages/home.page';

export class LoginFlow {
    constructor(private readonly homePage: HomePage) {}

    async loginWithRetry(
        username: string,
        password: string,
        maxInternalErrorRetries = 2
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxInternalErrorRetries + 1; attempt++) {
            await this.homePage.open();

            const result = await this.homePage.loginAndGetResult(username, password);

            if (result === 'success') {
                return;
            }

            if (result === 'invalid_credentials') {
                throw new Error(
                    `Login failed due to invalid credentials for username "${username}".`
                );
            }

            if (result === 'error' && attempt <= maxInternalErrorRetries) {
                continue;
            }

            throw new Error(
                `Login failed with internal error after ${attempt} attempts for username "${username}".`
            );
        }
    }
}