import { ApiClient } from '@api/client/api.client';
import { CurlClient } from '@api/client/curl.client';
import { Account } from '@api/models/account.types';
import { XmlParser } from '@api/parsers/xml.parser';
import { env } from '@utils/env';

export class AccountsApi {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly curlClient: CurlClient
    ) {}

    async getAccount(accountId: number): Promise<Account> {
        const response = await this.apiClient.get(`/accounts/${accountId}`, {
            timeout: 15000,
        });
        console.log(`Calling accounts API for accountId=${accountId}`);

        await this.apiClient.assertOk(response);

        const body = await this.apiClient.getBodyAsText(response);
        return this.parseSingleAccountXml(body);
    }

    buildCreateCheckingAccountCurlUrl(customerId: number, fromAccountId: number): string {
        const url = new URL(`${env.apiBaseUrl}/createAccount`);
        url.searchParams.set('customerId', String(customerId));
        url.searchParams.set('newAccountType', '0');
        url.searchParams.set('fromAccountId', String(fromAccountId));

        return url.toString();
    }

    async createCheckingAccount(customerId: number, fromAccountId: number): Promise<Account> {
        const curlUrl = this.buildCreateCheckingAccountCurlUrl(customerId, fromAccountId);

        console.log(`[AccountsApi] Executing curl POST: ${curlUrl}`);

        const responseBody = await this.curlClient.post(curlUrl, {
            Accept: 'application/xml',
        });

        return this.parseSingleAccountXml(responseBody);
    }
    private parseSingleAccountXml(xml: string): Account {
        const accountBlock = this.extractAccountBlock(xml);

        return {
            id: XmlParser.extractNumber(accountBlock, 'id'),
            customerId: XmlParser.extractNumber(accountBlock, 'customerId'),
            type: XmlParser.extractText(accountBlock, 'type'),
            balance: XmlParser.extractNumber(accountBlock, 'balance'),
        };
    }

    private extractAccountBlock(xml: string): string {
        const accountMatch = xml.match(/<account>([\s\S]*?)<\/account>/);

        if (!accountMatch) {
            throw new Error(`No <account> block found in XML response: ${xml}`);
        }

        return accountMatch[1];
    }
}