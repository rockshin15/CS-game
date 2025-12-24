// src/ui/context/GameContextVals.ts
import { createContext } from 'react';

// Imports de Tipos Básicos
import type { CalendarEvent, GameDate } from '../../core/types/CalendarTypes';
import type { JsonTeam } from '../screens/TeamSelectionScreen';

// Imports de Tipos de Competição e Torneio
import type { MatchResult } from '../../core/types/MatchTypes';
import type { MatchPairing } from '../../features/tournaments/TournamentStructure';
import type { ActiveTournament } from '../../features/tournaments/TournamentTypes';

// --- DEFINIÇÃO DE TIPOS ---

// Definimos que 'Match' é exatamente o que a estrutura de torneio gera (MatchPairing)
// Isso evita conflitos de 'any' ou tipos incompatíveis
export type Match = MatchPairing;

export interface GameContextType {
  state: GameState;
  advanceWeek: () => void;
  simulateWeek: () => void;
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void;
  setPlayerTeam: (team: JsonTeam) => void;
  processTournamentRound: (results: MatchResult[]) => void;
  // ADICIONE ISSO:
  clearLastMatchResult: () => void; 
}

// Interface Principal do Estado do Jogo
export interface GameState {
  // Data atual do jogo
  date: GameDate;
  
  // Gestão de Eventos e Calendário
  activeEvents: CalendarEvent[];   // Eventos aceitos acontecendo agora
  upcomingEvents: CalendarEvent[]; // Convites pendentes (Correção vital para os convites aparecerem)
  fullSchedule: CalendarEvent[];   // Todos os eventos do ano
  
  // Recursos do Jogador/Time
  managerFatigue: number;
  teamMoney: number;
  teamRankingPoints: number;

  // Estado da Competição Ativa
  currentMatches: Match[];              // Partidas agendadas para a semana atual
  userTeam: JsonTeam | null;            // Time escolhido pelo jogador
  activeTournament: ActiveTournament | null; // Dados detalhados do torneio rodando (se houver)
  lastMatchResult: MatchResult | null;

}

// Interface das Funções do Contexto (API que os componentes usam)
export interface GameContextType {
  state: GameState;
  
  // Funções de Controle de Tempo
  advanceWeek: () => void;
  simulateWeek: () => void; // Essencial para o botão de avançar rodar as partidas
  
  // Funções de Decisão e Gestão
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void;
  setPlayerTeam: (team: JsonTeam) => void;
  processTournamentRound: (results: MatchResult[]) => void;
}

// --- CRIAÇÃO DO CONTEXTO ---

export const GameContext = createContext<GameContextType | null>(null);