import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import {env} from "@utils/env";
type RequestOptions = {
    headers?: Record<string, string>;
    timeout?: number;
};

type PostRequestOptions = RequestOptions & {
    params?: Record<string, string | number | boolean>;
    data?: unknown;
    form?: Record<string, string | number | boolean>;
};

export class ApiClient {
    private static readonly REQUEST_TIMEOUT_MS = 15000;
    private static readonly MAX_RETRIES = 2;
    private static readonly RETRY_DELAY_MS = 1000;
    private static readonly RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

    constructor(private readonly request: APIRequestContext) {}

    async get(url: string, options?: RequestOptions): Promise<APIResponse> {
        console.log(`GET Request To ${url}`)
        return this.executeWithRetry(
            () =>
                this.request.get(env.apiBaseUrl + url, {
                    headers: {Accept: 'application/xml', ...options?.headers,}, timeout: options?.timeout ?? ApiClient.REQUEST_TIMEOUT_MS,}), 'GET', url
        );
    }

    async post(url: string, options?: PostRequestOptions): Promise<APIResponse> {
        console.log(`POST Request To ${url}`)
        return this.executeWithRetry(
            () =>
                this.request.post(env.apiBaseUrl + url, {
                    ...options,
                    headers: {
                        Accept: 'application/xml',
                        ...options?.headers,
                    },
                    timeout: options?.timeout ?? ApiClient.REQUEST_TIMEOUT_MS,
                }),
            'POST',
            url
        );
    }

    async assertOk(response: APIResponse): Promise<void> {
        const body = await response.text();
        expect(response.ok(), `Expected successful response, but received status ${response.status()} with response body ${body}`).toBeTruthy();
    }

    async getBodyAsText(response: APIResponse): Promise<string> {
        return response.text();
    }

    private async executeWithRetry(requestFn: () => Promise<APIResponse>, method: string, url: string): Promise<APIResponse> {
        let lastResponse: APIResponse | undefined;
        let lastError: unknown;

        for (let attempt = 1; attempt <= ApiClient.MAX_RETRIES + 1; attempt++) {
            try {
                const response = await requestFn();
                lastResponse = response;

                if (!this.shouldRetryResponse(response) || attempt > ApiClient.MAX_RETRIES) {
                    if (this.shouldRetryResponse(response) && attempt > ApiClient.MAX_RETRIES) {
                        console.warn(
                            `[ApiClient] ${method} ${url} returned retryable status ${response.status()} after ${attempt} attempts.`
                        );
                    }

                    return response;
                }

                console.warn(`[ApiClient] ${method} ${url} returned ${response.status()} on attempt ${attempt}. Retrying...`);

                await this.delay(ApiClient.RETRY_DELAY_MS * attempt);
            } catch (error) {
                lastError = error;

                if (attempt > ApiClient.MAX_RETRIES) {
                    throw error;
                }

                console.warn(`[ApiClient] ${method} ${url} failed on attempt ${attempt} with error: ${this.stringifyError(error)}. Retrying...`);
                await this.delay(ApiClient.RETRY_DELAY_MS * attempt);
            }
        }

        if (lastResponse) {
            return lastResponse;
        }

        throw lastError instanceof Error
            ? lastError
            : new Error(`Request failed for ${method} ${url}`);
    }

    private shouldRetryResponse(response: APIResponse): boolean {
        return ApiClient.RETRYABLE_STATUS_CODES.has(response.status());
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private stringifyError(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }
}