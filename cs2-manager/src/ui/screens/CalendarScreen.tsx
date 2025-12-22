import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import type { CalendarEvent, Month } from '../../core/types/CalendarTypes'; // Corrigido typo "type{"
import { MONTHS } from '../../features/calendar/CalendarGenerator';
import { Button } from '../components/Button';

// Cores baseadas no Tier (Estilo CS2)
const TIER_COLORS: Record<string, string> = {
  S: '#FFD700', // Gold
  A: '#A855F7', // Purple
  B: '#3B82F6', // Blue
  Qualify: '#10B981', // Green
};

const TYPE_COLORS: Record<string, string> = {
  Major: '#EF4444', // Red (Importante!)
  Bootcamp: '#F59E0B', // Orange
  Break: '#6B7280', // Gray
};

export default function CalendarScreen() {
  const game = useContext(GameContext);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  if (!game) return <div>Erro: GameContext não encontrado</div>;

  // MODIFICAÇÃO 1: Pegando a função de decisão do contexto
  const { state, advanceWeek, handleEventDecision } = game;
  const { date, fullSchedule } = state;

  // Função para saber se um evento ocorre numa semana específica
  const getEventsForWeek = (m: Month, w: number) => {
    return fullSchedule.filter(ev => {
      const isSameMonth = ev.startMonth === m;
      if (!isSameMonth) return false;
      
      const endWeek = ev.startWeek + ev.durationWeeks;
      return w >= ev.startWeek && w < endWeek;
    });
  };

  const isCurrentTime = (m: Month, w: number) => {
    return date.month === m && date.week === w;
  };

  const isPastTime = (m: Month, w: number) => {
    const monthIdx = MONTHS.indexOf(m);
    const currMonthIdx = MONTHS.indexOf(date.month);
    if (monthIdx < currMonthIdx) return true;
    if (monthIdx === currMonthIdx && w < date.week) return true;
    return false;
  };

  return (
    <div className="flex h-full bg-[#1b1b1b] text-white overflow-hidden">
      
      {/* --- ÁREA PRINCIPAL (CALENDÁRIO) --- */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#e1e1e1]">
              Calendário {date.year}
            </h1>
            <p className="text-gray-400">
              Semana Atual: <span className="text-yellow-400">{date.week} de {date.month}</span>
            </p>
          </div>
          <div className="flex gap-4">
             {/* Botão de Debug para avançar rápido */}
            <Button onClick={advanceWeek} variant="primary">
              Avançar Semana ({date.month} W{date.week})
            </Button>
          </div>
        </div>

        {/* Grid de Meses (4 colunas x 3 linhas) */}
        <div className="grid grid-cols-4 gap-4">
          {MONTHS.map((month) => {
            const monthIdx = MONTHS.indexOf(month);
            const currentIdx = MONTHS.indexOf(date.month);
            const isPastMonth = monthIdx < currentIdx;
            
            return (
              <div 
                key={month} 
                className={`border border-[#333] bg-[#222] p-3 rounded-lg flex flex-col gap-2
                  ${isPastMonth ? 'opacity-40 grayscale' : 'opacity-100'}
                  ${date.month === month ? 'ring-2 ring-yellow-500 bg-[#2a2a2a]' : ''}
                `}
              >
                <h3 className="font-bold text-center text-lg mb-2 text-gray-300">{month}</h3>
                
                {/* 4 Semanas do Mês */}
                {[1, 2, 3, 4].map(week => {
                  const events = getEventsForWeek(month, week);
                  const isCurrent = isCurrentTime(month, week);
                  const isPast = isPastTime(month, week);

                  return (
                    <div 
                      key={`w-${week}`} 
                      className={`
                        h-10 text-xs flex items-center px-2 rounded relative
                        ${isCurrent ? 'bg-yellow-900/30 border border-yellow-500/50' : 'bg-[#151515]'}
                        ${isPast ? 'bg-[#111]' : ''}
                      `}
                    >
                      <span className={`mr-2 font-mono ${isCurrent ? 'text-yellow-400' : 'text-gray-600'}`}>
                        W{week}
                      </span>

                      <div className="flex-1 flex gap-1 overflow-hidden">
                        {events.map(ev => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="flex-1 h-6 rounded cursor-pointer hover:brightness-125 transition-all flex items-center justify-center text-[10px] font-bold truncate px-1 shadow-sm"
                            // MODIFICAÇÃO 2: Estilo dinâmico baseado no STATUS
                            style={{ 
                              backgroundColor: ev.status === 'DECLINED' ? '#222' : (TYPE_COLORS[ev.type] || TIER_COLORS[ev.tier] || '#555'),
                              opacity: ev.status === 'PENDING' ? 0.6 : 1, // Eventos não decididos ficam meio transparentes
                              border: ev.status === 'ACCEPTED' ? '1px solid white' : 'none', // Borda se confirmou
                              color: ev.status === 'DECLINED' ? '#555' : (ev.tier === 'S' || ev.type === 'Major' ? 'white' : 'black'),
                              textDecoration: ev.status === 'DECLINED' ? 'line-through' : 'none'
                            }}
                            title={`${ev.name} (${ev.status})`}
                          >
                            {ev.tier === 'S' ? '★ ' : ''}{ev.name.substring(0, 12)}
                          </div>
                        ))}
                        {events.length === 0 && !isPast && (
                          <span className="text-gray-700 text-[10px] italic">Treino</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- PAINEL LATERAL (DETALHES) --- */}
      {selectedEvent && (
        <div className="w-80 bg-[#151515] border-l border-[#333] p-6 flex flex-col shadow-2xl z-10">
          <div className="flex justify-between items-start mb-6">
            <span 
              className="px-2 py-1 rounded text-xs font-bold text-black"
              style={{ backgroundColor: TIER_COLORS[selectedEvent.tier] || '#fff' }}
            >
              TIER {selectedEvent.tier}
            </span>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="text-gray-500 hover:text-white"
            >
              ✕
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-white leading-tight">
            {selectedEvent.name}
          </h2>
          <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider">
            {selectedEvent.type} Event
          </p>

          <div className="space-y-4 text-sm">
            <div className="bg-[#222] p-3 rounded border border-[#333]">
              <p className="text-gray-500 text-xs">Premiação Total</p>
              <p className="text-green-400 font-mono text-lg">
                ${selectedEvent.prizePool.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#222] p-3 rounded border border-[#333]">
                <p className="text-gray-500 text-xs">Custo Fadiga</p>
                <p className={`font-bold ${selectedEvent.fatigueCost > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedEvent.fatigueCost > 0 ? `+${selectedEvent.fatigueCost}` : selectedEvent.fatigueCost}
                </p>
              </div>
              <div className="bg-[#222] p-3 rounded border border-[#333]">
                <p className="text-gray-500 text-xs">Prestígio</p>
                <p className="text-yellow-400 font-bold">
                  {selectedEvent.prestige} pts
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-xs mb-1">Duração</p>
              <p className="text-white">
                {selectedEvent.startMonth}, Semana {selectedEvent.startWeek} 
                <span className="text-gray-600 mx-2">➔</span> 
                {selectedEvent.durationWeeks} semanas
              </p>
            </div>

            {/* MODIFICAÇÃO 3: Lógica de Botões baseada no Status */}
            <div className="mt-8 pt-6 border-t border-[#333]">
              
              {/* Caso 1: Evento Pendente */}
              {selectedEvent.status === 'PENDING' && (
                 <div className="flex flex-col gap-3">
                   <p className="text-sm text-gray-400 mb-2">Convite Pendente</p>
                   
                   <button 
                     onClick={() => {
                        handleEventDecision(selectedEvent.id, 'ACCEPTED');
                        setSelectedEvent(null);
                     }}
                     className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold transition-colors flex justify-center items-center gap-2"
                   >
                     <span>✅ Aceitar Convite</span>
                   </button>

                   <button 
                     onClick={() => {
                        handleEventDecision(selectedEvent.id, 'DECLINED');
                        setSelectedEvent(null);
                     }}
                     className="w-full bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 py-2 rounded font-bold transition-colors"
                   >
                     Recusar
                   </button>
                   
                   <p className="text-xs text-center text-gray-600 mt-2">
                     {selectedEvent.tier === 'S' 
                       ? "Recusar eventos Tier S afeta seu ranking." 
                       : "Recusar eventos ajuda a recuperar fadiga."}
                   </p>
                 </div>
              )}

              {/* Caso 2: Já Aceito */}
              {selectedEvent.status === 'ACCEPTED' && (
                 <div className="bg-green-900/20 border border-green-500/30 p-4 rounded text-center">
                    <p className="text-green-400 font-bold mb-1">Participação Confirmada</p>
                    <p className="text-xs text-gray-400">O time viajará nesta data.</p>
                 </div>
              )}

              {/* Caso 3: Recusado */}
              {selectedEvent.status === 'DECLINED' && (
                 <div className="bg-red-900/20 border border-red-500/30 p-4 rounded text-center">
                    <p className="text-red-400 font-bold">Convite Recusado</p>
                    <p className="text-xs text-gray-500">Agenda livre para treinos.</p>
                 </div>
              )}

              {/* Caso 4: Completado (Futuro) */}
              {selectedEvent.status === 'COMPLETED' && (
                 <div className="bg-gray-800 p-4 rounded text-center">
                    <p className="text-gray-400 font-bold">Evento Finalizado</p>
                 </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}