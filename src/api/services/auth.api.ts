import { ApiClient } from '@api/client/api.client';
import { Customer } from '@api/models/customer.types';

export class AuthApi {
    constructor(private readonly apiClient: ApiClient) {}

    async login(username: string, password: string): Promise<Customer> {
        const path = `/login/${username}/${password}`;
        console.log(`Calling API: ${path}`);

        const response = await this.apiClient.get(path);
        console.log(`Login API status: ${response.status()}`);

        await this.apiClient.assertOk(response);

        const contentType = response.headers()['content-type'] ?? '';
        const body = await response.text();


        if (contentType.includes('application/json')) {
            return JSON.parse(body) as Customer;
        }

        const customerBlockMatch = body.match(/<customer[\s\S]*?<\/customer>/i);
        const customerBlock = customerBlockMatch?.[0] ?? body;

        const idMatch = customerBlock.match(/<id>(\d+)<\/id>/i);

        if (!idMatch) {
            throw new Error(`Could not extract customer id from login response: ${body}`);
        }

        return {
            id: Number(idMatch[1]),
            firstName: '',
            lastName: '',
        };
    }
}