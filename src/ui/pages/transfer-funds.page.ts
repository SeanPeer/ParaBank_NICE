import { expect, Page } from '@playwright/test';
import { BasePage } from '@ui/pages/base.page';

export class TransferFundsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    private get pageTitle() {
        return this.page.getByRole('heading', { name: /transfer funds/i });
    }

    private get amountInput() {
        return this.page.locator('#amount');
    }

    private get fromAccountSelect() {
        return this.page.locator('#fromAccountId');
    }

    private get toAccountSelect() {
        return this.page.locator('#toAccountId');
    }

    private get transferButton() {
        return this.page.locator('input[value="Transfer"]');
    }

    private get successMessage() {
        return this.page.locator('#showResult');
    }

    async waitForPageLoaded(): Promise<void> {
        await super.waitForPageLoaded();
        await expect(this.pageTitle).toBeVisible();
        await expect(this.amountInput).toBeVisible();
        await expect(this.fromAccountSelect).toBeVisible();
        await expect(this.toAccountSelect).toBeVisible();
        await expect(this.transferButton).toBeVisible();
    }

    async transferFunds(fromAccountId: number, toAccountId: number, amount: number): Promise<void> {
        await this.amountInput.fill(String(amount));
        await this.fromAccountSelect.selectOption(String(fromAccountId));
        await this.toAccountSelect.selectOption(String(toAccountId));
        await this.transferButton.click();
    }

    async assertTransferSucceeded(): Promise<void> {
        await expect(this.successMessage).toContainText(/transfer complete|successfully transferred/i);
    }
}