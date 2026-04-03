import { ApiClient } from '@api/client/api.client';
import { Account } from '@api/models/account.types';

export class CustomersApi {
    constructor(private readonly apiClient: ApiClient) {}

    async getCustomerAccounts(customerId: number): Promise<Account[]> {
        const path = `/customers/${customerId}/accounts`;
        console.log(`Calling accounts API for customerId=${customerId}`);

        const response = await this.apiClient.get(path, { timeout: 15000 });
        console.log(`Accounts API status: ${response.status()}`);

        await this.apiClient.assertOk(response);

        const body = await this.apiClient.getBodyAsText(response);

        return this.parseAccountsXml(body);
    }

    private parseAccountsXml(xml: string): Account[] {
        const accountBlocks = [...xml.matchAll(/<account>([\s\S]*?)<\/account>/g)];

        if (accountBlocks.length === 0) {
            throw new Error(`No <account> entries found in accounts response: ${xml}`);
        }

        return accountBlocks.map((match) => {
            const block = match[1];

            return {
                id: this.extractNumber(block, 'id'),
                customerId: this.extractNumber(block, 'customerId'),
                type: this.extractText(block, 'type'),
                balance: this.extractNumber(block, 'balance'),
            };
        });
    }

    private extractText(xmlBlock: string, tagName: string): string {
        const match = xmlBlock.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`));
        if (!match) {
            throw new Error(`Missing <${tagName}> in XML block: ${xmlBlock}`);
        }
        return match[1].trim();
    }

    private extractNumber(xmlBlock: string, tagName: string): number {
        const value = this.extractText(xmlBlock, tagName);
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
            throw new Error(`Value for <${tagName}> is not a valid number: ${value}`);
        }

        return parsed;
    }
}