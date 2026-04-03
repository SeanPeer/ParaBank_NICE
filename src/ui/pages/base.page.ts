import { expect, Page } from '@playwright/test';

export abstract class BasePage {
    constructor(protected readonly page: Page) {}

    /**
     * Navigates to a relative path based on Playwright's configured baseURL.
     * Example: await this.goto('/register.htm');
     */
    async goto(path = ''): Promise<void> {
        await this.page.goto(path);
        await this.waitForPageLoaded();
    }

    /**
     * Generic page-load wait.
     * Uses DOM readiness and a minimal body visibility check.
     * Can be overridden in specific page objects when needed.
     */
    async waitForPageLoaded(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator('body')).toBeVisible();
    }
}