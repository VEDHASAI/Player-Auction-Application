import { Player, Team, SquadRules } from './types';
import { calculateMinRequiredBudget } from './auction-utils';

export interface ValidationResult {
    allowed: boolean;
    reason?: string;
    minRequiredBudget?: number;
    remainingPurse?: number;
}

export function validateBid(
    team: Team,
    activePlayer: Player,
    bidAmount: number,
    rules: SquadRules,
    allPlayers: Player[],
    categoryLabels: string[] = [],
    categoryOptions: Record<string, string[]> = {}
): ValidationResult {
    const playersInTeam = team.players.map(pId => allPlayers.find(p => p.id === pId)).filter(Boolean) as Player[];
    const defBase = rules?.defaultBasePrice || 2000000;

    // 1. Basic Budget Check
    if (bidAmount > team.remainingBudget) {
        return { allowed: false, reason: `Team ${team.name} does not have enough budget to place this bid.` };
    }

    const remainingPurse = team.remainingBudget - bidAmount;

    // 2. Max Total Players Check
    if (rules.maxPlayers && team.players.length >= rules.maxPlayers) {
        return { allowed: false, reason: `Team ${team.name} already has the maximum of ${rules.maxPlayers} players.` };
    }

    // 3. Role Max Checks
    const role = activePlayer.role;
    const roleCounts = {
        'Batsman': playersInTeam.filter(p => p.role === 'Batsman').length,
        'Bowler': playersInTeam.filter(p => p.role === 'Bowler').length,
        'All-Rounder': playersInTeam.filter(p => p.role === 'All-Rounder').length,
        'Wicket Keeper': playersInTeam.filter(p => p.role === 'Wicket Keeper').length,
    };

    const roleMaxMap: Record<string, number | undefined> = {
        'Batsman': rules.maxBatsmen,
        'Bowler': rules.maxBowlers,
        'All-Rounder': rules.maxAllRounders,
        'Wicket Keeper': rules.maxWicketKeepers
    };

    if (roleMaxMap[role] && roleCounts[role] >= (roleMaxMap[role] || 0)) {
        return { allowed: false, reason: `Team ${team.name} already has the maximum of ${roleMaxMap[role]} ${role}s.` };
    }

    // 4. Category Max Checks
    if (activePlayer.categories && rules.categoryRules) {
        for (const [label, cat] of Object.entries(activePlayer.categories)) {
            const catRule = rules.categoryRules[cat];
            if (catRule?.max) {
                const currentCatCount = playersInTeam.filter(p => p.categories?.[label] === cat).length;
                if (currentCatCount >= catRule.max) {
                    return { allowed: false, reason: `Team ${team.name} already has the maximum of ${catRule.max} ${cat} players.` };
                }
            }
        }
    }

    // 5. Squad Slots "Impossible" Check
    if (rules.maxPlayers) {
        const slotsAfterThis = rules.maxPlayers - (team.players.length + 1);

        // Roles min
        let mandatoryOtherRoles = 0;
        const roleMinMap: Record<string, number | undefined> = {
            'Batsman': rules.minBatsmen,
            'Bowler': rules.minBowlers,
            'All-Rounder': rules.minAllRounders,
            'Wicket Keeper': rules.minWicketKeepers
        };

        Object.entries(roleMinMap).forEach(([r, min]) => {
            if (min) {
                const current = role === r ? roleCounts[r as keyof typeof roleCounts] + 1 : roleCounts[r as keyof typeof roleCounts];
                mandatoryOtherRoles += Math.max(0, min - current);
            }
        });

        // Categories min
        let mandatoryOtherCategories = 0;
        if (rules.categoryRules) {
            Object.entries(rules.categoryRules).forEach(([cat, catRule]) => {
                if (catRule.min) {
                    const currentCatCount = playersInTeam.filter(p => p.categories && Object.values(p.categories).includes(cat)).length;
                    const nextCatCount = activePlayer.categories && Object.values(activePlayer.categories).includes(cat) ? currentCatCount + 1 : currentCatCount;
                    mandatoryOtherCategories += Math.max(0, catRule.min - nextCatCount);
                }
            });
        }

        if (mandatoryOtherRoles > slotsAfterThis) {
            return { allowed: false, reason: `Buying this ${role} leaves only ${slotsAfterThis} slots, but you still need ${mandatoryOtherRoles} more players of other roles.` };
        }
        if (mandatoryOtherCategories > slotsAfterThis) {
            return { allowed: false, reason: `Buying this player leaves only ${slotsAfterThis} slots, but you still need ${mandatoryOtherCategories} more players of other categories.` };
        }
    }

    // 6. Budget "Impossible" Check (Zip-Max Algorithm)
    const minRequiredBudget = calculateMinRequiredBudget(
        team,
        rules,
        allPlayers,
        categoryLabels,
        categoryOptions,
        activePlayer // Pass activePlayer to assume it's bought
    );

    if (remainingPurse < minRequiredBudget) {
        return {
            allowed: false,
            reason: "Insufficient budget to complete mandatory squad requirements.",
            minRequiredBudget,
            remainingPurse
        };
    }
    console.log('allowed-------', minRequiredBudget);
    return { allowed: true, remainingPurse, minRequiredBudget };
}
