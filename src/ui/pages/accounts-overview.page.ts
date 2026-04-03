import { expect, Page } from '@playwright/test';
import { BasePage } from '@ui/pages/base.page';

export class AccountsOverviewPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private get accountsOverviewTitle() {
        return this.page.getByRole('heading', { name: /accounts overview/i });
    }

    private get accountsTable() {
        return this.page.locator('#accountTable');
    }

    private get transferFundsLink() {
        return this.page.getByRole('link', { name: /transfer funds/i });
    }

    private get logoutLink() {
        return this.page.getByRole('link', { name: /log out/i });
    }

    async waitForPageLoaded(): Promise<void> {
        await super.waitForPageLoaded();
        await expect(this.accountsOverviewTitle).toBeVisible();
        await expect(this.accountsTable).toBeVisible();
    }

    async assertAccountVisible(accountId: number): Promise<void> {
        await expect(this.page.getByRole('link', { name: String(accountId) })).toBeVisible({ timeout: 10000 });
    }

    async openTransferFunds(): Promise<void> {
        await this.transferFundsLink.click();
    }

    async logout(): Promise<void> {
        await this.logoutLink.click();
    }
}