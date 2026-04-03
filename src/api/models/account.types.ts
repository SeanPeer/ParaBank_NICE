export interface Account {
    id: number;
    customerId?: number;
    type?: 'CHECKING' | 'SAVINGS' | string;
    balance: number;
}