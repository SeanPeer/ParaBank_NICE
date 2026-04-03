import { RegisterUserData } from '@ui/pages/register.page';

export class UserFactory {
    static create(): RegisterUserData {
        const uniquePart = Math.random().toString(36).slice(2, 10);

        return {
            firstName: 'Sean',
            lastName: 'Automation',
            address: '1 Test Street',
            city: 'Tel Aviv',
            state: 'Center',
            zipCode: '12345',
            phone: '0501234567',
            ssn: `${Math.floor(100000000 + Math.random() * 900000000)}`,
            username: `SeanBirion${uniquePart}`,
            password: 'Password123!',
        };
    }
}