import React, { createContext, useState, useEffect } from 'react';
import type{ CalendarEvent, GameDate } from '../../core/types/CalendarTypes';
import { CalendarGenerator, MONTHS } from '../../features/calendar/CalendarGenerator';

type GameState = {
  date: GameDate;
  activeEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  fullSchedule: CalendarEvent[];
  
  // Recursos do Jogador
  managerFatigue: number; // 0 a 100 (Quanto maior, pior o time joga)
  teamMoney: number;      // Dinheiro em caixa
  teamRankingPoints: number; // Pontos de Ranking
};
// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext<{
  state: GameState;
  advanceWeek: () => void;
  handleEventDecision: (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => void; // Nova função exposta
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    date: { week: 1, month: 'Jan', year: 2025 },
    activeEvents: [],
    upcomingEvents: [],
    fullSchedule: [],
    managerFatigue: 0,
    teamMoney: 50000,
    teamRankingPoints: 1000
  });

  useEffect(() => {
    const schedule = CalendarGenerator.generateYearlySchedule(2025);
    setState(prev => ({ ...prev, fullSchedule: schedule }));
  }, []);

  // --- LÓGICA 1: TOMADA DE DECISÃO ---
  const handleEventDecision = (eventId: string, decision: 'ACCEPTED' | 'DECLINED') => {
    setState(prev => {
      const newSchedule = prev.fullSchedule.map(ev => {
        if (ev.id === eventId) {
            // Regra básica: Não pode aceitar dois eventos na mesma data (simplificado)
            // Aqui você poderia adicionar verificação de conflito de datas
            return { ...ev, status: decision };
        }
        return ev;
      });

      // Se recusou um evento importante (Tier S), perde prestígio imediatamente?
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

  // --- LÓGICA 2: AVANÇAR O TEMPO E SOFRER CONSEQUÊNCIAS ---
  const advanceWeek = () => {
    setState(prev => {
      let { week, month, year } = prev.date;
      
      // 1. Processar Efeitos da Semana ATUAL antes de mudar
      // Se estamos jogando um evento ACEITO nesta semana, aumenta fadiga
      const currentActiveEvents = prev.fullSchedule.filter(ev => 
        ev.status === 'ACCEPTED' &&
        ev.startMonth === month && 
        week >= ev.startWeek && 
        week < (ev.startWeek + ev.durationWeeks)
      );

      let fatigueChange = -5; // Recuperação natural base (descanso)
      
      if (currentActiveEvents.length > 0) {
        // Se está jogando, soma o custo de fadiga do evento (dividido pela duração pra não aplicar tudo de uma vez)
        currentActiveEvents.forEach(ev => {
           fatigueChange += (ev.fatigueCost / ev.durationWeeks);
        });
      } else {
        // Se não tem evento, recupera mais rápido (Training Week)
        fatigueChange = -15; 
      }

      // 2. Avança Data
      week++;
      if (week > 4) {
        week = 1;
        const monthIndex = MONTHS.indexOf(month);
        if (monthIndex === 11) {
            month = 'Jan'; year++;
        } else {
            month = MONTHS[monthIndex + 1];
        }
      }

      // 3. Atualiza estado
      return {
        ...prev,
        date: { week, month, year },
        managerFatigue: Math.min(100, Math.max(0, prev.managerFatigue + fatigueChange)),
        // Recalcula ativos para a nova semana visualmente
        activeEvents: prev.fullSchedule.filter(ev => 
            ev.status === 'ACCEPTED' && // Só mostra como "Ativo" se aceitamos
            ev.startMonth === month && week >= ev.startWeek && week < (ev.startWeek + ev.durationWeeks)
        )
      };
    });
  };

  return (
    <GameContext.Provider value={{ state, advanceWeek, handleEventDecision }}>
      {children}
    </GameContext.Provider>
  );
}