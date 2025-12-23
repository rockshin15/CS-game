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
import type{ ActiveTournament, SwissStanding } from '../../features/tournaments/TournamentTypes';
import{ MatchEngine } from '../../core/classes/MatchEngine';
import { Team } from '../../core/classes/Team';

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
    matches = TournamentStructure.generateGSLOpening(participants.slice(0, 4)); // Exemplo: Pega os 4 primeiros para um grupo
  } else if (format === 'SINGLE_ELIMINATION') {
    matches = TournamentStructure.generatePlayoffs(participants);
  }

  const tournamentData: ActiveTournament = {
    id: event.id,
    name: event.name,
    format: format,
    currentRound: 1,
    totalRounds: format === 'SWISS' ? 5 : 3, // Simplificação. Idealmente calculado baseado no nº de times (log2)
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
      // 1. Atualiza o status no agendamento
      const newSchedule = prev.fullSchedule.map(ev => {
        if (ev.id === eventId) return { ...ev, status: decision };
        return ev;
      });

      // Busca o evento original para ver detalhes
      const targetEvent = prev.fullSchedule.find(e => e.id === eventId);
      
      let prestigePenalty = 0;
      // Penalidade apenas se recusar evento Tier S
      if (decision === 'DECLINED' && targetEvent?.tier === 'S') {
        prestigePenalty = 50; 
      }

      // --- INICIALIZAÇÃO IMEDIATA ---
      let newMatches = prev.currentMatches;
      let newTournamentData = prev.activeTournament;

      // Se aceitou e a data do evento é HOJE (Mês e Semana atuais), inicia já!
      if (decision === 'ACCEPTED' && targetEvent) {
          const { month, week } = prev.date;
          if (targetEvent.startMonth === month && targetEvent.startWeek === week) {
               console.log("Evento começa na semana atual! Inicializando imediatamente...");
               const initData = initializeTournament(targetEvent, prev.userTeam?.name || 'PlayerTeam');
               newMatches = initData.matches;
               newTournamentData = initData.tournamentData;
          }
      }
  
      return {
        ...prev,
        fullSchedule: newSchedule,
        teamRankingPoints: Math.max(0, prev.teamRankingPoints - prestigePenalty),
        currentMatches: newMatches,
        activeTournament: newTournamentData 
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

        // --- LÓGICA SWISS ---
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
        // --- LÓGICA GSL / PLAYOFFS (Placeholder Seguro) ---
        else {
            // TODO: Implementar lógica real para GSL e Playoffs
            console.warn("Lógica para GSL/Playoffs ainda não implementada completamente. Finalizando torneio para evitar travamento.");
            tournament.currentRound += 1;
            
            // Lógica simples de 'Mata-Mata': Se restam 2 times, acabou. Se não, gera semi-finais etc.
            // Por enquanto, forçamos o fim para não travar o jogo do usuário.
            tournament.isFinished = true; 
            nextMatches = [];
        }

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
      // 1. Bloqueio: Se tem torneio ativo não finalizado, não avança
      if (prev.activeTournament && !prev.activeTournament.isFinished) {
          console.warn("Complete o torneio atual antes de avançar a semana!");
          return prev; // Retorna o estado sem alterações
      }

      // 2. Preparação para limpar o torneio anterior
      let scheduleUpdate = [...prev.fullSchedule];
      let moneyUpdate = prev.teamMoney;
      let rankingUpdate = prev.teamRankingPoints;
      
      // *AJUSTE NO FLUXO*: Para simplificar, assumimos que processTournamentRound NÃO seta activeTournament como null,
      // ele apenas seta isFinished: true. O advanceWeek é quem limpa (null).
      
      if (prev.activeTournament && prev.activeTournament.isFinished) {
          const eventId = prev.activeTournament.id;
          const eventRef = prev.fullSchedule.find(e => e.id === eventId);
          
          if (eventRef) {
              scheduleUpdate = scheduleUpdate.map(ev => 
                  ev.id === eventId ? { ...ev, status: 'COMPLETED' } : ev
              );

              // Melhoria no cálculo de recompensa (Placeholder)
              let performanceMultiplier = 0.1; // Padrão participação
              if (prev.activeTournament.swissStandings && prev.userTeam) {
                   const myStats = prev.activeTournament.swissStandings[prev.userTeam.name];
                   if (myStats && myStats.wins >= 3) performanceMultiplier = 0.5; 
                   if (myStats && myStats.wins === 5) performanceMultiplier = 1.0; 
              }

              moneyUpdate += (eventRef.prizePool * performanceMultiplier); 
              rankingUpdate += (eventRef.prestige); 
              
              console.log(`Torneio ${eventRef.name} arquivado. Recompensas entregues.`);
          }
      }

      const { week, month, year } = prev.date;
      
      // 3. Lógica de Fadiga
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

      // 4. Cálculo da Nova Data
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

      // 5. Verificar Início Automático de Torneio na PRÓXIMA semana
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
        activeEvents: scheduleUpdate.filter(ev => 
            ev.status === 'ACCEPTED' && 
            ev.startMonth === nextMonth && 
            nextWeek >= ev.startWeek && 
            nextWeek < (ev.startWeek + ev.durationWeeks)
        ),
        currentMatches: newMatches,
        // Se começou um novo, usa ele. Se não, anula o antigo (limpeza final do isFinished)
        activeTournament: newTournamentData ? newTournamentData : null 
      };
    });
  };

  // --- NOVA FUNÇÃO: SIMULAR SEMANA / PARTIDAS ---
  const simulateWeek = () => {
    // 1. Verifica se existem partidas para jogar
    const matchesToPlay = state.currentMatches;
    if (!matchesToPlay || matchesToPlay.length === 0) {
        console.warn("Nenhuma partida pendente para simular.");
        return;
    }

    console.log(`Simulando ${matchesToPlay.length} partidas...`);

    // 2. Gera os resultados usando a MatchEngine
    const results: MatchResult[] = matchesToPlay.map(match => {
        // Escolhe um mapa aleatório para dar variedade
        const mapPool = ['de_mirage', 'de_dust2', 'de_inferno', 'de_nuke', 'de_ancient'];
        const randomMap = mapPool[Math.floor(Math.random() * mapPool.length)];

        // Executa a simulação
        // O cast 'as unknown as Team' é usado porque o MatchEngine espera instâncias da classe Team,
        // mas nossos dados vêm como JSON/TeamAttributes. 
        return MatchEngine.simulateMatch(
            match.teamA as unknown as Team, 
            match.teamB as unknown as Team, 
            randomMap
        );
    });

    // 3. Processa os resultados (Atualiza tabela, avança rodada, etc)
    processTournamentRound(results);
  };

  // --- RETORNO DO COMPONENTE ---
  return (
    <GameContext.Provider value={{
        state,
        setPlayerTeam,
        handleEventDecision,
        processTournamentRound,
        advanceWeek,
        simulateWeek // <--- Adicionado ao value
    }}>
        {children}
    </GameContext.Provider>
  );
}