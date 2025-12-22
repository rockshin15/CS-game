// src/ui/context/GameContext.tsx
import React, { useState } from 'react';
import { CalendarGenerator, MONTHS } from '../../features/calendar/CalendarGenerator';
import { TournamentInviter } from '../../features/tournaments/TournamentInviter';
import { TournamentStructure } from '../../features/tournaments/TournamentStructure';
import realTeams from '../../data/realTeams.json';
import type { TeamAttributes } from '../../core/types/TeamTypes';
import type { CalendarEvent } from '../../core/types/CalendarTypes';

// IMPORTAMOS O CONTEXTO E TIPOS DO NOVO ARQUIVO
import { GameContext, type GameState, type Match } from './GameContextVals';

// --- LÓGICA INTERNA (Não exportada) ---

type SwissStanding = {
  wins: number;
  losses: number;
  played: string[];
};

function onTournamentStart(event: CalendarEvent, userTeamId: string): Match[] {
  const allTeamsTyped = realTeams as unknown as TeamAttributes[];
  const participants = TournamentInviter.getParticipants(allTeamsTyped, event, userTeamId);
  console.log(`Iniciando ${event.name} com ${participants.length} times.`);

  let matches: Match[] = [];
  if (event.format === 'SWISS') {
    const initialStandings: Record<string, SwissStanding> = {};
    participants.forEach((p) => {
        initialStandings[p.id] = { wins: 0, losses: 0, played: [] };
    });
    matches = TournamentStructure.generateSwissPairings(participants, initialStandings);
  } else if (event.format === 'GSL_GROUPS') {
    matches = TournamentStructure.generateGSLOpening(participants.slice(0, 4));
  } else if (event.format === 'SINGLE_ELIMINATION') {
    matches = TournamentStructure.generatePlayoffs(participants);
  }
  return matches;
}

// --- PROVIDER (Único componente exportado) ---

export function GameProvider({ children }: { children: React.ReactNode }) {
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
        currentMatches: [],
        userTeam: null 
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setPlayerTeam = (team: any) => {
      setState(prev => ({ ...prev, userTeam: team }));
  };

  const handleEventDecision = (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    setState(prev => {
      const newSchedule = prev.fullSchedule.map(ev => {
        if (ev.id === eventId) return { ...ev, status: decision };
        return ev;
      });
      let prestigePenalty = 0;
      const targetEvent = prev.fullSchedule.find(e => e.id === eventId);
      if (decision === 'DECLINED' && targetEvent?.tier === 'S') prestigePenalty = 50; 

      return {
        ...prev,
        fullSchedule: newSchedule,
        teamRankingPoints: Math.max(0, prev.teamRankingPoints - prestigePenalty)
      };
    });
  };

  const advanceWeek = () => {
    setState(prev => {
      const { week, month, year } = prev.date;
      
      const currentActiveEvents = prev.fullSchedule.filter(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === month && 
        week >= ev.startWeek && 
        week < (ev.startWeek + ev.durationWeeks)
      );

      let fatigueChange = -5; 
      if (currentActiveEvents.length > 0) {
        currentActiveEvents.forEach(ev => { fatigueChange += (ev.fatigueCost / ev.durationWeeks); });
      } else {
        fatigueChange = -15; 
      }

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

      let newMatches = prev.currentMatches;
      const startingEvent = prev.fullSchedule.find(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === nextMonth &&
        ev.startWeek === nextWeek
      );

      if (startingEvent) {
          newMatches = onTournamentStart(startingEvent, prev.userTeam?.name || 'PlayerTeam');
      }

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
    <GameContext.Provider value={{ state, advanceWeek, handleEventDecision, setPlayerTeam }}>
      {children}
    </GameContext.Provider>
  );
}