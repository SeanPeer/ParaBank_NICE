export const env = {
    baseUrl: process.env.BASE_URL ?? 'https://parabank.parasoft.com/parabank',
    apiBaseUrl:
        process.env.API_BASE_URL ??
        'https://parabank.parasoft.com/parabank/services/bank',
    apiUsername: process.env.API_USERNAME ?? 'john',
    apiPassword: process.env.API_PASSWORD ?? 'demo',
    apiRetryCount: Number(process.env.API_RETRY_COUNT ?? 2),
    apiRetryDelayMs: Number(process.env.API_RETRY_DELAY_MS ?? 1000),
};