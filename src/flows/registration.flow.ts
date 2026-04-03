import {RegisterPage, RegisterUserData, RegistrationSubmitResult,} from '@ui/pages/register.page';
import { UserFactory } from '@utils/user.factory';

export class RegistrationFlow {
    constructor(private readonly registerPage: RegisterPage) {}

    async registerUniqueUser(options?: { maxUsernameRetries?: number; maxTransientRetries?: number; }): Promise<RegisterUserData> {
        const maxUsernameRetries = options?.maxUsernameRetries ?? 3;
        const maxTransientRetries = options?.maxTransientRetries ?? 2;

        let usernameRetryCount = 0;
        let transientRetryCount = 0;
        let lastUser: RegisterUserData | undefined;

        while (usernameRetryCount <= maxUsernameRetries) {
            const user = UserFactory.create();
            lastUser = user;

            await this.registerPage.waitForPageLoaded();

            const result: RegistrationSubmitResult =
                await this.registerPage.submitAndGetResult(user);

            if (result === 'success') {
                await this.registerPage.assertRegistrationSucceeded();
                return user;
            }

            if (result === 'username_exists') {
                usernameRetryCount++;
                continue;
            }

            if (result === 'transient_error') {
                if (transientRetryCount >= maxTransientRetries) {
                    throw new Error(
                        `Registration failed due to transient error after ${maxTransientRetries + 1} attempts. Last username: ${lastUser.username}`
                    );
                }

                transientRetryCount++;
                continue;
            }
        }

        throw new Error(
            `Failed to register a unique user after ${maxUsernameRetries + 1} username attempts. Last username: ${lastUser?.username}`
        );
    }
}