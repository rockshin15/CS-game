// src/core/types/MatchTypes.ts

export type Side = 'CT' | 'TR';

// Novo tipo para controlar o que foi comprado
export type LoadoutType = 'Full Buy' | 'Force Buy' | 'Eco';

export interface RoundLog {
    roundNumber: number;
    winnerId: string;
    sideWinner: Side;
    message: string;
    
    // Dados Econômicos para o Log
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
    rounds: RoundLog[]; // Histórico completo
}
export interface MatchResult {
    winnerId: string;
    loserId: string;
    scoreA: number;
    scoreB: number;
    mapName: string;
    rounds: RoundLog[];
}