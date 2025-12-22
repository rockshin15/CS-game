// src/ui/context/GameContextVals.ts
import { createContext } from 'react';
import type { CalendarEvent, GameDate } from '../../core/types/CalendarTypes';
import type { JsonTeam } from '../screens/TeamSelectionScreen';

// --- TIPOS ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Match = any;

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
};

// --- CRIAÇÃO DO CONTEXTO ---

export const GameContext = createContext<{
  state: GameState;
  advanceWeek: () => void;
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void;
  setPlayerTeam: (team: JsonTeam) => void;
} | null>(null);