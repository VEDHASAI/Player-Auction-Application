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

import { Player, SquadRules } from './types';

export function getEffectiveBasePrice(player: Player, rules: SquadRules): number {
    // 1. Check for Category Match (Highest priority)
    if (player.categories && rules.categoryRules) {
        for (const cat of Object.values(player.categories)) {
            const catRule = rules.categoryRules[cat];
            if (catRule?.basePrice) {
                return catRule.basePrice;
            }
        }
    }

    // 2. Return recorded price if it's not the default fallback or if no global default exists
    // (If the player has a specific price recorded that isn't the generic 20L, we trust it)
    if (player.basePrice !== 2000000) {
        return player.basePrice;
    }

    // 3. Global Default Base Price
    if (rules.defaultBasePrice) {
        return rules.defaultBasePrice;
    }

    // 4. Absolute Fallback
    return player.basePrice || 2000000;
}
