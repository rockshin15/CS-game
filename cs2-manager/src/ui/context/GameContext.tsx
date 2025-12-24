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

import { GameContext, type GameState, type Match } from './GameContextVals';
import type { ActiveTournament, SwissStanding } from '../../features/tournaments/TournamentTypes';
import { MatchEngine } from '../../core/classes/MatchEngine';
import { Team } from '../../core/classes/Team';

// --- HELPER: Calcular Valor Numérico do Tempo (Para saber o que é futuro) ---
const getWeekValue = (month: string, week: number, year: number) => {
  const monthIndex = MONTHS.findIndex(m => m === month);
  return (year * 48) + (monthIndex * 4) + week;
};

// --- HELPER: Filtrar Convites Pendentes ---
function getPendingInvites(schedule: CalendarEvent[], currentMonth: string, currentWeek: number, currentYear: number) {
  const nowValue = getWeekValue(currentMonth, currentWeek, currentYear);

  return schedule.filter(ev => {
    if (ev.status !== 'PENDING') return false;
    const eventStartValue = getWeekValue(ev.startMonth, ev.startWeek, currentYear);
    // Mostra convites de eventos que começam daqui a até 8 semanas
    return eventStartValue >= nowValue && eventStartValue <= (nowValue + 8);
  });
}

function initializeTournament(event: CalendarEvent, userTeamId: string): { matches: Match[], tournamentData: ActiveTournament } {
    const allTeamsTyped = realTeams as unknown as TeamAttributes[];
    const participants = TournamentInviter.getParticipants(allTeamsTyped, event, userTeamId);
    console.log(`Iniciando ${event.name} com ${participants.length} times.`);
  
    let matches: Match[] = [];
    const swissStandings: Record<string, SwissStanding> = {};
  
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
    const initialInvites = getPendingInvites(schedule, 'Jan', 1, 2025);

    return {
      date: { week: 1, month: 'Jan', year: 2025 },
      activeEvents: [],
      upcomingEvents: initialInvites,
      fullSchedule: schedule,
      managerFatigue: 0,
      teamMoney: 50000,
      teamRankingPoints: 1000,
      currentMatches: [],
      userTeam: null,
      activeTournament: null,
      lastMatchResult: null 
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

      const targetEvent = prev.fullSchedule.find(e => e.id === eventId);
      let prestigePenalty = 0;
      if (decision === 'DECLINED' && targetEvent?.tier === 'S') {
        prestigePenalty = 50;
      }

      let newMatches = prev.currentMatches;
      let newTournamentData = prev.activeTournament;

      if (decision === 'ACCEPTED' && targetEvent) {
        const { month, week } = prev.date;
        if (targetEvent.startMonth === month && targetEvent.startWeek === week) {
          const initData = initializeTournament(targetEvent, prev.userTeam?.name || 'PlayerTeam');
          newMatches = initData.matches;
          newTournamentData = initData.tournamentData;
        }
      }

      const updatedUpcoming = prev.upcomingEvents.filter(ev => ev.id !== eventId);

      return {
        ...prev,
        fullSchedule: newSchedule,
        upcomingEvents: updatedUpcoming,
        teamRankingPoints: Math.max(0, prev.teamRankingPoints - prestigePenalty),
        currentMatches: newMatches,
        activeTournament: newTournamentData
      };
    });
  };

  // --- LÓGICA DE PROGRESSÃO ---
  const checkTournamentProgression = (tournament: ActiveTournament) => {
    if (tournament.format === 'SWISS' && tournament.currentRound > tournament.totalRounds) {
       const top8 = tournament.participants
          .filter(t => tournament.swissStandings && tournament.swissStandings[t.id].wins >= 3)
          .slice(0, 8); 
       
       if (top8.length >= 2) {
           tournament.format = 'SINGLE_ELIMINATION'; 
           tournament.currentRound = 1;
           tournament.totalRounds = 3; 
           tournament.swissStandings = undefined; 
           
           console.log("Avançando para Playoffs com:", top8.map(t => t.name));
           return TournamentStructure.generatePlayoffs(top8);
       } else {
           return null; 
       }
    }
    return null; 
  };

  const processTournamentRound = (results: MatchResult[]) => {
    setState(prev => {
      if (!prev.activeTournament) return prev;

      const tournament = { ...prev.activeTournament };
      const newHistory = [...tournament.matchHistory, ...results];
      tournament.matchHistory = newHistory;

      let nextMatches: Match[] = [];

      // 1. Atualiza Pontuações (se Suíço)
      if (tournament.format === 'SWISS' && tournament.swissStandings) {
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
      }

      // 2. Avança Rodada
      tournament.currentRound += 1;

      // 3. Verifica se o estágio atual acabou
      if (tournament.currentRound > tournament.totalRounds) {
         
         const progressionMatches = checkTournamentProgression(tournament);

         if (progressionMatches && progressionMatches.length > 0) {
             nextMatches = progressionMatches;
         } else {
             // Fim do Torneio
             tournament.isFinished = true;
             nextMatches = [];
             console.log("Torneio Finalizado!");
         }

      } else {
         if (tournament.format === 'SWISS' && tournament.swissStandings) {
            nextMatches = TournamentStructure.generateSwissPairings(
              tournament.participants,
              tournament.swissStandings
            );
         } else if (tournament.format === 'SINGLE_ELIMINATION') {
             // Simplificação: encerra por enquanto se não tiver lógica de chaveamento
             tournament.isFinished = true; 
             nextMatches = [];
         }
      }

      const updatedTournament = tournament.isFinished ? { ...tournament, isFinished: true } : tournament;

      return {
        ...prev,
        activeTournament: updatedTournament,
        currentMatches: nextMatches,
      };
    });
  };

  const advanceWeek = () => {
    setState(prev => {
      if (prev.activeTournament && !prev.activeTournament.isFinished) {
        console.warn("Complete o torneio atual antes de avançar a semana!");
        return prev;
      }

      let scheduleUpdate = [...prev.fullSchedule];
      let moneyUpdate = prev.teamMoney;
      let rankingUpdate = prev.teamRankingPoints;

      if (prev.activeTournament && prev.activeTournament.isFinished) {
        const eventId = prev.activeTournament.id;
        const eventRef = prev.fullSchedule.find(e => e.id === eventId);

        if (eventRef) {
          scheduleUpdate = scheduleUpdate.map(ev =>
            ev.id === eventId ? { ...ev, status: 'COMPLETED' } : ev
          );
          let performanceMultiplier = 0.1;
          if (prev.activeTournament.swissStandings && prev.userTeam) {
            const myStats = prev.activeTournament.swissStandings[prev.userTeam.name]; 
            if (myStats && myStats.wins >= 3) performanceMultiplier = 0.5;
            if (myStats && myStats.wins === 5) performanceMultiplier = 1.0;
          }
          moneyUpdate += (eventRef.prizePool * performanceMultiplier);
          rankingUpdate += (eventRef.prestige);
        }
      }

      const { week, month, year } = prev.date;

      const currentActiveEvents = scheduleUpdate.filter(ev =>
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

      const nextInvites = getPendingInvites(scheduleUpdate, nextMonth, nextWeek, nextYear);

      let newMatches: Match[] = [];
      let newTournamentData: ActiveTournament | null = null;

      const startingEvent = scheduleUpdate.find(ev =>
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
        teamMoney: moneyUpdate,
        teamRankingPoints: rankingUpdate,
        fullSchedule: scheduleUpdate,
        upcomingEvents: nextInvites,
        activeEvents: scheduleUpdate.filter(ev =>
          ev.status === 'ACCEPTED' &&
          ev.startMonth === nextMonth &&
          nextWeek >= ev.startWeek &&
          nextWeek < (ev.startWeek + ev.durationWeeks)
        ),
        currentMatches: newMatches,
        activeTournament: newTournamentData ? newTournamentData : null
      };
    });
  };

  const clearLastMatchResult = () => {
    setState(prev => ({ ...prev, lastMatchResult: null }));
  };

  // --- MOVIDO PARA CIMA (ANTES DO RETURN) ---
  const simulateWeek = () => {
    const { currentMatches, activeTournament, userTeam } = state;

    if (!currentMatches || currentMatches.length === 0) {
      console.warn("Nenhuma partida pendente para simular.");
      return;
    }

    console.log(`Simulando Rodada ${activeTournament?.currentRound}...`);

    const results: MatchResult[] = currentMatches.map(match => {
      const teamAInstance = Team.fromJSON(match.teamA);
      const teamBInstance = Team.fromJSON(match.teamB);
      
      const mapPool = ['de_mirage', 'de_dust2', 'de_inferno', 'de_nuke', 'de_ancient'];
      const randomMap = mapPool[Math.floor(Math.random() * mapPool.length)];

      const result = MatchEngine.simulateMatch(teamAInstance, teamBInstance, randomMap);

      const isUserMatch = (match.teamA.id === userTeam?.id || match.teamB.id === userTeam?.id);
      
      if (!isUserMatch) {
          result.rounds = []; 
      }

      return result;
    });

    // Salva o resultado do usuário para exibir na UI depois, se necessário
    const userResult = results.find(r => r.winnerId === userTeam?.id || r.loserId === userTeam?.id);
    if (userResult) {
        setState(prev => ({ ...prev, lastMatchResult: userResult }));
    }

    processTournamentRound(results);
  };

  return (
    <GameContext.Provider value={{
      state,
      setPlayerTeam,
      handleEventDecision,
      processTournamentRound,
      advanceWeek,
      simulateWeek,
      clearLastMatchResult 
    }}>
      {children}
    </GameContext.Provider>
  );
}