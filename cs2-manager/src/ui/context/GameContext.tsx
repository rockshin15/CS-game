// src/ui/context/GameContext.tsx
import React, { useState } from 'react';
import { CalendarGenerator, MONTHS } from '../../features/calendar/CalendarGenerator';
import { TournamentInviter } from '../../features/tournaments/TournamentInviter';
import { TournamentStructure } from '../../features/tournaments/TournamentStructure';
import realTeams from '../../data/realTeams.json';
import type { TeamAttributes } from '../../core/types/TeamTypes';
import type { CalendarEvent } from '../../core/types/CalendarTypes';
import type { MatchResult } from '../../core/types/MatchTypes';
import type { JsonTeam } from '../screens/TeamSelectionScreen';

// Importamos tipos do Contexto e do Torneio
import { GameContext, type GameState, type Match } from './GameContextVals';
import type { ActiveTournament, SwissStanding } from '../../features/tournaments/TournamentTypes';

// --- LÓGICA INTERNA (Helpers) ---

function initializeTournament(event: CalendarEvent, userTeamId: string): { matches: Match[], tournamentData: ActiveTournament } {
  const allTeamsTyped = realTeams as unknown as TeamAttributes[];
  const participants = TournamentInviter.getParticipants(allTeamsTyped, event, userTeamId);
  console.log(`Iniciando ${event.name} com ${participants.length} times.`);

  let matches: Match[] = [];
  const swissStandings: Record<string, SwissStanding> = {};

  // Cast explícito para o tipo de formato permitido
  const format = event.format as 'SWISS' | 'GSL_GROUPS' | 'SINGLE_ELIMINATION';

  if (format === 'SWISS') {
    participants.forEach((p) => {
        swissStandings[p.id] = { wins: 0, losses: 0, played: [] };
    });
    matches = TournamentStructure.generateSwissPairings(participants, swissStandings);
  } else if (format === 'GSL_GROUPS') {
    matches = TournamentStructure.generateGSLOpening(participants.slice(0, 4));
  } else if (format === 'SINGLE_ELIMINATION') {
    matches = TournamentStructure.generatePlayoffs(participants);
  }

  const tournamentData: ActiveTournament = {
    id: event.id,
    name: event.name,
    format: format,
    currentRound: 1,
    totalRounds: format === 'SWISS' ? 5 : 3,
    participants,
    swissStandings: format === 'SWISS' ? swissStandings : undefined,
    matchHistory: [],
    isFinished: false
  };

  return { matches, tournamentData };
}

// --- PROVIDER ---

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
        userTeam: null,
        activeTournament: null
    };
  });

  const setPlayerTeam = (team: JsonTeam) => {
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
      
      // Penalidade apenas se recusar evento Tier S
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

  const processTournamentRound = (results: MatchResult[]) => {
    setState(prev => {
        if (!prev.activeTournament) return prev;

        const tournament = { ...prev.activeTournament };
        const newHistory = [...tournament.matchHistory, ...results];
        tournament.matchHistory = newHistory;

        let nextMatches: Match[] = [];

        // Lógica SWISS
        if (tournament.format === 'SWISS' && tournament.swissStandings) {
            // 1. Atualizar Standings
            results.forEach(res => {
                const winnerId = res.winnerId;
                const loserId = res.loserId;
                
                if (tournament.swissStandings![winnerId]) {
                    tournament.swissStandings![winnerId].wins += 1;
                    tournament.swissStandings![winnerId].played.push(loserId);
                }
                if (tournament.swissStandings![loserId]) {
                    tournament.swissStandings![loserId].losses += 1;
                    tournament.swissStandings![loserId].played.push(winnerId);
                }
            });

            // 2. Avançar Rodada
            tournament.currentRound += 1;
            
            // Verifica se acabou (exemplo fixo em 5 rodadas para Swiss)
            if (tournament.currentRound > tournament.totalRounds) {
                tournament.isFinished = true;
                nextMatches = []; 
                console.log("Torneio Suíço Finalizado!");
            } else {
                // 3. Gerar Próxima Rodada
                nextMatches = TournamentStructure.generateSwissPairings(
                    tournament.participants, 
                    tournament.swissStandings
                );
            }
        }
        
        // TODO: Implementar lógica futura para GSL e Playoffs

        const updatedTournament = tournament.isFinished ? null : tournament;

        return {
            ...prev,
            activeTournament: updatedTournament,
            currentMatches: nextMatches,
        };
    });
  };

  const advanceWeek = () => {
    setState(prev => {
      // Bloqueio: Se tem torneio ativo não finalizado, não avança a semana
      if (prev.activeTournament && !prev.activeTournament.isFinished) {
          console.warn("Complete o torneio atual antes de avançar a semana!");
          return prev;
      }

      const { week, month, year } = prev.date;
      
      // Lógica de Fadiga (Baseada nos eventos ativos da semana ATUAL antes de avançar)
      const currentActiveEvents = prev.fullSchedule.filter(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === month && 
        week >= ev.startWeek && 
        week < (ev.startWeek + ev.durationWeeks)
      );

      let fatigueChange = -5; // Recuperação base
      if (currentActiveEvents.length > 0) {
        currentActiveEvents.forEach(ev => { fatigueChange += (ev.fatigueCost / ev.durationWeeks); });
      } else {
        fatigueChange = -15; // Recuperação extra se livre
      }

      // Cálculo da Nova Data
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

      // Verificar se começa um torneio na NOVA semana
      let newMatches: Match[] = [];
      let newTournamentData: ActiveTournament | null = null;

      const startingEvent = prev.fullSchedule.find(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === nextMonth &&
        ev.startWeek === nextWeek
      );

      if (startingEvent) {
          const initData = initializeTournament(startingEvent, prev.userTeam?.name || 'PlayerTeam');
          newMatches = initData.matches;
          newTournamentData = initData.tournamentData;
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
        currentMatches: newMatches,
        activeTournament: newTournamentData
      };
    });
  };

  return (
    <GameContext.Provider value={{ state, advanceWeek, handleEventDecision, setPlayerTeam, processTournamentRound }}>
      {children}
    </GameContext.Provider>
  );
}