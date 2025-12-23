import { createContext } from 'react';
import type { CalendarEvent, GameDate } from '../../core/types/CalendarTypes';
import type { JsonTeam } from '../screens/TeamSelectionScreen';

// --- NOVOS IMPORTS NECESSÁRIOS ---
// O erro acontece porque esta linha abaixo estava faltando:
import type { MatchResult } from '../../core/types/MatchTypes'; 
import type { MatchPairing } from '../../features/tournaments/TournamentStructure';
import type { ActiveTournament } from '../../features/tournaments/TournamentTypes'; 

// --- TIPOS ---

// Agora Match é igual a MatchPairing (para parar de usar 'any')
export type Match = MatchPairing;

export type GameState = {
  date: GameDate;
  activeEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  fullSchedule: CalendarEvent[];
  
  managerFatigue: number;
  teamMoney: number;
  teamRankingPoints: number;

  currentMatches: Match[];
  userTeam: JsonTeam | null; 
  
  // Novo estado para controlar o torneio ativo
  activeTournament: ActiveTournament | null;
};

// --- CRIAÇÃO DO CONTEXTO ---

export const GameContext = createContext<{
  state: GameState;
  advanceWeek: () => void;
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void;
  setPlayerTeam: (team: JsonTeam) => void;
  
  // Aqui usamos o MatchResult que importamos lá em cima
  processTournamentRound: (results: MatchResult[]) => void; 
} | null>(null);