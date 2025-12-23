// src/ui/screens/Dashboard.tsx
import React, { useContext } from 'react';
import { GameContext } from '../context/GameContextVals';

// Helper simples para cores de Tier (consistente com o calendário)
const getTierColorClass = (tier: string) => {
  switch (tier) {
    case 'S': return 'bg-yellow-500 text-black';
    case 'A': return 'bg-purple-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'Qualify': return 'bg-green-500 text-black';
    default: return 'bg-gray-500 text-white';
  }
};

export default function Dashboard() {
  const game = useContext(GameContext);

  if (!game) return <div className="p-10 text-white">Carregando Contexto...</div>;

  const { state, handleEventDecision, advanceWeek } = game;
  const { upcomingEvents, date, userTeam, teamMoney, teamRankingPoints, managerFatigue } = state;

  return (
    <div className="flex flex-col h-full bg-[#1b1b1b] text-white overflow-y-auto">
      
      {/* --- HEADER DO DASHBOARD --- */}
      <div className="p-6 bg-gradient-to-r from-[#222] to-[#1a1a1a] border-b border-[#333]">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {userTeam ? userTeam.name : 'Sem Time'}
            </h1>
            <p className="text-gray-400 text-sm">
              Gerenciamento da Temporada {date.year}
            </p>
          </div>
          
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Semana Atual</p>
              <p className="text-xl font-mono text-white">{date.month}, Week {date.week}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Caixa</p>
              <p className="text-xl font-mono text-green-400">${teamMoney.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Ranking</p>
              <p className="text-xl font-mono text-yellow-400">{teamRankingPoints} pts</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Fadiga</p>
              <p className={`text-xl font-bold ${managerFatigue > 50 ? 'text-red-500' : 'text-blue-400'}`}>
                {managerFatigue}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="p-6 flex-1 flex flex-col gap-8">

        {/* SEÇÃO DE CONVITES (Inbox) */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">📬 Convites Pendentes</h2>
            {upcomingEvents.length > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {upcomingEvents.length} Novos
              </span>
            )}
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-[#222] border border-[#333] rounded-lg p-8 text-center text-gray-500 italic">
              Nenhuma proposta de torneio nesta semana. Avance o tempo ou verifique o Calendário.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-[#2a2a2a] border border-[#444] rounded-lg overflow-hidden shadow-lg hover:border-gray-500 transition-colors">
                  
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#333] flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${getTierColorClass(event.tier)}`}>
                        Tier {event.tier}
                      </span>
                      <h3 className="font-bold text-lg mt-2 leading-tight">{event.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{event.type}</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-green-400 font-mono text-sm">${event.prizePool.toLocaleString()}</span>
                       <span className="text-[10px] text-gray-500">Prize Pool</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duração:</span>
                      <span className="text-gray-300">{event.durationWeeks} semanas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Custo Fadiga:</span>
                      <span className={event.fatigueCost > 0 ? 'text-red-400' : 'text-green-400'}>
                        {event.fatigueCost > 0 ? `+${event.fatigueCost}` : event.fatigueCost}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prestígio:</span>
                      <span className="text-yellow-500">+{event.prestige}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-3 bg-[#151515] flex gap-2">
                    <button
                      onClick={() => handleEventDecision(event.id, 'ACCEPTED')}
                      className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded font-bold text-sm transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleEventDecision(event.id, 'DECLINED')}
                      className="flex-1 bg-transparent border border-red-800 text-red-500 hover:bg-red-900/20 py-2 rounded font-bold text-sm transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOTÃO DE AVANÇAR (Atalho Rápido) */}
        <section className="mt-auto pt-6 border-t border-[#333]">
           <button 
             onClick={advanceWeek}
             className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-all active:scale-95"
           >
             Avançar para Próxima Semana ({date.month} W{date.week === 4 ? 1 : date.week + 1}) ⏭
           </button>
        </section>

      </div>
    </div>
  );
}