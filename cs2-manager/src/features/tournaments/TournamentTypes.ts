import type{ TeamAttributes } from "../../core/types/TeamTypes";
import type{ MatchResult } from "../../core/types/MatchTypes"; // Certifique-se de que exportou isso

export interface SwissStanding {
  wins: number;
  losses: number;
  played: string[]; // IDs dos times já enfrentados
}

export interface ActiveTournament {
  id: string; // ID do evento no Calendar
  name: string;
  format: 'SWISS' | 'GSL_GROUPS' | 'SINGLE_ELIMINATION';
  currentRound: number;
  totalRounds: number; // Ex: 5 para Swiss Major
  participants: TeamAttributes[];
  
  // Estado específico do Suíço
  swissStandings?: Record<string, SwissStanding>;
  
  // Histórico para logs ou chaves
  matchHistory: MatchResult[];
  
  // Flag para saber se o torneio acabou e precisamos entregar o prêmio
  isFinished: boolean;
}