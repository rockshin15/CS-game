import React, { createContext, useState } from 'react';
import type { CalendarEvent, GameDate } from '../../core/types/CalendarTypes';
import type { TeamAttributes } from '../../core/types/TeamTypes';
import { CalendarGenerator, MONTHS } from '../../features/calendar/CalendarGenerator';

import { TournamentInviter } from '../../features/tournaments/TournamentInviter';
import { TournamentStructure } from '../../features/tournaments/TournamentStructure';
import realTeams from '../../data/realTeams.json';

// --- TIPOS AUXILIARES ---

// Define a estrutura exata que o SwissPairings espera
type SwissStanding = {
  wins: number;
  losses: number;
  played: string[];
};

// Usamos 'any' aqui intencionalmente para aceitar 'MatchPairing' ou qualquer formato de partida
// que venha do TournamentStructure, sem travar o build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Match = any;

type GameState = {
  date: GameDate;
  activeEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  fullSchedule: CalendarEvent[];
  
  managerFatigue: number;
  teamMoney: number;
  teamRankingPoints: number;

  currentMatches: Match[]; 
};

// --- LÓGICA DE INICIALIZAÇÃO DE TORNEIO ---
function onTournamentStart(event: CalendarEvent, userTeamId: string): Match[] {
  // Conversão Dupla: Força o JSON a ser aceito como TeamAttributes[] ignorando campos faltantes
  const allTeamsTyped = realTeams as unknown as TeamAttributes[];
  
  const participants = TournamentInviter.getParticipants(
    allTeamsTyped,
    event,
    userTeamId
  );

  console.log(`Iniciando ${event.name} com ${participants.length} times.`);

  let matches: Match[] = [];

  if (event.format === 'SWISS') {
    // Agora tipado corretamente como SwissStanding para satisfazer a função geradora
    const initialStandings: Record<string, SwissStanding> = {};
    
    participants.forEach((p) => {
        initialStandings[p.id] = { wins: 0, losses: 0, played: [] };
    });
    
    matches = TournamentStructure.generateSwissPairings(participants, initialStandings);
  } 
  else if (event.format === 'GSL_GROUPS') {
    matches = TournamentStructure.generateGSLOpening(participants.slice(0, 4));
  }
  else if (event.format === 'SINGLE_ELIMINATION') {
    matches = TournamentStructure.generatePlayoffs(participants);
  }

  return matches;
}

// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext<{
  state: GameState;
  advanceWeek: () => void;
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Inicialização Lazy (dentro da função) para evitar erro de setState síncrono
  const [state, setState] = useState<GameState>(() => {
    const schedule = CalendarGenerator.generateYearlySchedule(2025);
    return {
        date: { week: 1, month: 'Jan', year: 2025 },
        activeEvents: [],
        upcomingEvents: [],
        fullSchedule: schedule,
        managerFatigue: 0,
        teamMoney: 50000,
        teamRankingPoints: 1000,
        currentMatches: []
    };
  });

  const handleEventDecision = (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    setState(prev => {
      const newSchedule = prev.fullSchedule.map(ev => {
        if (ev.id === eventId) {
            return { ...ev, status: decision };
        }
        return ev;
      });

      let prestigePenalty = 0;
      const targetEvent = prev.fullSchedule.find(e => e.id === eventId);
      if (decision === 'DECLINED' && targetEvent?.tier === 'S') {
          prestigePenalty = 50; 
      }

      return {
        ...prev,
        fullSchedule: newSchedule,
        teamRankingPoints: Math.max(0, prev.teamRankingPoints - prestigePenalty)
      };
    });
  };

  const advanceWeek = () => {
    setState(prev => {
      // Correção: Usar 'const' aqui pois não reatribuímos estas variáveis, criamos novas abaixo
      const { week, month, year } = prev.date;
      
      // 1. Processar Efeitos da Semana ATUAL
      const currentActiveEvents = prev.fullSchedule.filter(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === month && 
        week >= ev.startWeek && 
        week < (ev.startWeek + ev.durationWeeks)
      );

      let fatigueChange = -5; 
      
      if (currentActiveEvents.length > 0) {
        currentActiveEvents.forEach(ev => {
           fatigueChange += (ev.fatigueCost / ev.durationWeeks);
        });
      } else {
        fatigueChange = -15; 
      }

      // 2. Calcular Nova Data
      let nextWeek = week + 1;
      let nextMonth = month;
      let nextYear = year;

      if (nextWeek > 4) {
        nextWeek = 1;
        const monthIndex = MONTHS.indexOf(month);
        if (monthIndex === 11) {
            nextMonth = 'Jan'; 
            nextYear++;
        } else {
            nextMonth = MONTHS[monthIndex + 1];
        }
      }

      // 3. Verificar se algum torneio COMEÇA na nova data
      let newMatches = prev.currentMatches;
      
      const startingEvent = prev.fullSchedule.find(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === nextMonth &&
        ev.startWeek === nextWeek
      );

      if (startingEvent) {
          // Substitua 'user-team-id' pelo ID real do seu time
          newMatches = onTournamentStart(startingEvent, 'user-team-id');
      }

      // 4. Retorna novo estado imutável
      return {
        ...prev,
        date: { week: nextWeek, month: nextMonth, year: nextYear },
        managerFatigue: Math.min(100, Math.max(0, prev.managerFatigue + fatigueChange)),
        activeEvents: prev.fullSchedule.filter(ev => 
            ev.status === 'ACCEPTED' && 
            ev.startMonth === nextMonth && 
            nextWeek >= ev.startWeek && 
            nextWeek < (ev.startWeek + ev.durationWeeks)
        ),
        currentMatches: newMatches
      };
    });
  };

  return (
    <GameContext.Provider value={{ state, advanceWeek, handleEventDecision }}>
      {children}
    </GameContext.Provider>
  );
}