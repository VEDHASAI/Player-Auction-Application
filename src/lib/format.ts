import { CurrencyUnit } from './types';

export function formatCurrency(amount: number, unit: CurrencyUnit): string {
    if (unit === 'Crores') {
        const crores = amount / 10000000;
        return `₹${crores.toFixed(2)} Cr`;
    } else if (unit === 'Lakhs') {
        const lakhs = amount / 100000;
        return `₹${lakhs.toLocaleString('en-IN')} L`;
    } else {
        const thousands = amount / 1000;
        return `₹${thousands.toLocaleString('en-IN')} K`;
    }
}

export function getRawValue(amount: number, unit: CurrencyUnit): string {
    if (unit === 'Crores') {
        return (amount / 10000000).toString();
    }
    if (unit === 'Thousands') {
        return (amount / 1000).toString();
    }
    return (amount / 100000).toString();
}
