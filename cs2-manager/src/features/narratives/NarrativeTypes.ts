// src/features/narrative/NarrativeTypes.ts
import { Player } from "../../core/classes/Player";

export const HighlightType = {
    ACE: 'ACE',
    CLUTCH_1V2: 'CLUTCH_1V2',
    CLUTCH_1V3: 'CLUTCH_1V3',
    CLUTCH_1V4: 'CLUTCH_1V4',
    CLUTCH_1V5: 'CLUTCH_1V5',
    TRIPLE_KILL: 'TRIPLE_KILL',
    QUAD_KILL: 'QUAD_KILL',
    NINJA_DEFUSE: 'NINJA_DEFUSE',
    ECO_WIN: 'ECO_WIN',
    FLAWLESS_ROUND: 'FLAWLESS_ROUND',
    COMEBACK_ROUND: 'COMEBACK_ROUND',
    PERFECT_UTILITY: 'PERFECT_UTILITY',
    TEAM_ACE: 'TEAM_ACE',
} as const;

export type HighlightType = typeof HighlightType[keyof typeof HighlightType];

export const WeaponType = {
    RIFLE: 'RIFLE',
    SMG: 'SMG',
    PISTOL: 'PISTOL',
    SNIPER: 'SNIPER',
    SHOTGUN: 'SHOTGUN',
    KNIFE: 'KNIFE'
} as const;

export type WeaponType = typeof WeaponType[keyof typeof WeaponType];

export const Position = {
    FAVORABLE: 'FAVORABLE',   // Vantagem de ângulo / Cover
    NEUTRAL: 'NEUTRAL',       // Posição padrão
    EXPOSED: 'EXPOSED',       // Pego na rotação / Aberto
    PLANTED: 'PLANTED',       // Post-plant
} as const;

export type Position = typeof Position[keyof typeof Position];

export interface KillEvent {
    killer: Player;
    victim: Player;
    weapon: WeaponType;
    isHeadshot: boolean;
    isTradeKill: boolean;
    tradeTime: number; // segundos após a morte do amigo
    wasFlashed: boolean;
    throughSmoke: boolean;
    distance: number; // metros (simulado)
    timeInRound: number;
    context: 'opening' | 'execute' | 'retake' | 'clutch' | 'postplant' | 'mid';
    position: Position;
}

export interface UtilityEvent {
    player: Player;
    type: 'smoke' | 'flash' | 'molotov' | 'he';
    impact: 'blocked_rotation' | 'denied_position' | 'assisted_kill' | 'damage_dealt' | 'intel_gained';
    value: number; // Score de impacto (0-100)
    description: string;
}

export interface RoundNarrative {
    roundNumber: number;
    phase: string;
    keyMoments: string[];
    killFeed: KillEvent[];
    utilityEvents: UtilityEvent[];
    highlights: HighlightType[];
    mvp: Player | null;
    economyImpact: string;
    tacticalSummary: string;
    finalNarrative: string;
    momentum: number; 
    tension: number; 
    intelAdvantage: string;
    synergyScore: number;
}

export interface PlayerMatchPerformance {
    player: Player;
    kills: number;
    deaths: number;
    assists: number;
    firstKills: number;
    firstDeaths: number;
    clutchAttempts: number;
    clutchWins: number;
    multiKills: { round: number; count: number }[];
    adr: number;
    utilityDamage: number;
    flashAssists: number;
    tradesExecuted: number;
    tradesReceived: number;
    rating: number; // HLTV 2.0 style rating (simplificado)
}

export interface TeamMomentum {
    value: number; // -100 a +100
    streak: number; 
    comingBack: boolean; 
    psychological: number; // Moral 0-100
}