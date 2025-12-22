// src/core/types/MatchTypes.ts
import type { KillEvent } from "../../features/narratives/NarrativeTypes"; // <--- Importe isso

export type Side = 'CT' | 'TR';
export type LoadoutType = 'Full Buy' | 'Force Buy' | 'Eco';

export interface RoundLog {
    roundNumber: number;
    winnerId: string;
    sideWinner: Side;
    message: string;
    
    // Adicionamos este campo vital
    killFeed: KillEvent[]; 

    // Dados Econômicos existentes
    loadoutA: LoadoutType;
    loadoutB: LoadoutType;
    moneyA: number;
    moneyB: number;
}

export interface MatchResult {
    winnerId: string;
    loserId: string;
    scoreA: number;
    scoreB: number;
    mapName: string;
    rounds: RoundLog[];
}