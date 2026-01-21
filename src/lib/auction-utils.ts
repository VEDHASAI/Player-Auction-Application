import { Player, Team, SquadRules, AppConfig } from './types';

export function calculateMinRequiredBudget(
    team: Team,
    rules: SquadRules,
    allPlayers: Player[],
    categoryLabels: string[] = [],
    categoryOptions: Record<string, string[]> = {},
    activePlayer?: Player
): number {
    const playersInTeam = team.players.map(pId => allPlayers.find(p => p.id === pId)).filter(Boolean) as Player[];
    const defBase = rules.defaultBasePrice || 2000000;

    const requirementLists: number[][] = [];

    // Category Requirements
    categoryLabels.forEach(label => {
        const list: number[] = [];
        const options = categoryOptions[label] || [];
        options.forEach(opt => {
            const rule = rules.categoryRules?.[opt];
            if (rule && rule.min) {
                const currentCatCount = playersInTeam.filter(p => p.categories?.[label] === opt).length;
                const nextCatCount = activePlayer?.categories?.[label] === opt ? currentCatCount + 1 : currentCatCount;
                const needed = Math.max(0, rule.min - nextCatCount);
                const price = rule.basePrice || defBase;
                for (let i = 0; i < needed; i++) list.push(price);
            }
        });
        if (list.length > 0) {
            list.sort((a, b) => b - a);
            requirementLists.push(list);
        }
    });

    // Role Requirements
    const roleList: number[] = [];
    const roleCounts = {
        'Batsman': playersInTeam.filter(p => p.role === 'Batsman').length,
        'Bowler': playersInTeam.filter(p => p.role === 'Bowler').length,
        'All-Rounder': playersInTeam.filter(p => p.role === 'All-Rounder').length,
        'Wicket Keeper': playersInTeam.filter(p => p.role === 'Wicket Keeper').length,
    };

    const roleMap = [
        { key: 'minBatsmen', label: 'Batsman' },
        { key: 'minBowlers', label: 'Bowler' },
        { key: 'minAllRounders', label: 'All-Rounder' },
        { key: 'minWicketKeepers', label: 'Wicket Keeper' }
    ];

    roleMap.forEach(check => {
        const minVal = (rules as any)[check.key];
        if (minVal) {
            let current = roleCounts[check.label as keyof typeof roleCounts] || 0;
            if (activePlayer?.role === check.label) current++;
            const needed = Math.max(0, minVal - current);
            for (let i = 0; i < needed; i++) roleList.push(defBase);
        }
    });

    if (roleList.length > 0) {
        roleList.sort((a, b) => b - a);
        requirementLists.push(roleList);
    }

    const maxNeededSlots = requirementLists.length > 0 ? Math.max(...requirementLists.map(l => l.length)) : 0;
    let minBudget = 0;
    for (let i = 0; i < maxNeededSlots; i++) {
        const slotCosts = requirementLists.map(l => l[i] || 0);
        minBudget += Math.max(...slotCosts);
    }

    const minTotal = rules.minPlayers || 0;
    const totalNeeded = Math.max(0, minTotal - (team.players.length + (activePlayer ? 1 : 0)));
    if (totalNeeded > maxNeededSlots) {
        minBudget += (totalNeeded - maxNeededSlots) * defBase;
    }

    return minBudget;
}

export function calculateReserveMoney(
    team: Team,
    config: AppConfig,
    allPlayers: Player[]
): number {
    const minBudget = calculateMinRequiredBudget(
        team,
        config.rules,
        allPlayers,
        config.categoryLabels || [],
        config.categoryOptions || {}
    );

    // "least slot if bid increment"
    const increments = config.bidIncrements || [];
    const leastIncrement = increments.length > 0 ? Math.min(...increments) : 0;

    return minBudget + leastIncrement;
}
