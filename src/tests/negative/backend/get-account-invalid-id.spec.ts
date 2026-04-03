import { test, expect } from '@fixtures/app.fixture';

test('API negative - get account with invalid account id', async ({
                                                                      apiClient,
                                                                  }) => {
    const invalidAccountId = 999999999;

    await test.step('Call get account endpoint with invalid account id', async () => {
        const response = await apiClient.get(`/accounts/${invalidAccountId}`, {timeout: 15000,});

        const body = await response.text();

        expect(response.ok(), `Expected invalid account lookup to fail, but got status ${response.status()}`).toBeFalsy();
        expect(response.status(), `Expected invalid account lookup not to return 200`).not.toBe(200);
        expect(body.length, 'Expected invalid account lookup to return a non-empty error body').toBeGreaterThan(0);
    });
});