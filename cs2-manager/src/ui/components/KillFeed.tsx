// src/ui/components/KillFeed.tsx
import React from 'react';
import type { KillEvent } from '../../features/narratives/NarrativeTypes';

export function KillFeed({ events }: { events: KillEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      marginTop: '10px',
      padding: '10px',
      backgroundColor: '#1f2937', // Fundo escuro para contraste
      borderRadius: '6px',
      fontSize: '12px',
      borderLeft: '4px solid #4b5563'
    }}>
      {events.map((kill, idx) => (
        <KillFeedItem key={idx} event={kill} />
      ))}
    </div>
  );
}

const KillFeedItem = ({ event }: { event: KillEvent }) => {
  // Formata o tempo restante (ex: 1:45)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Ícones visuais para contexto
  const getWeaponIcon = (w: string) => {
    if (w === 'SNIPER') return '🦅'; // AWP
    if (w === 'PISTOL') return '🔫';
    if (w === 'KNIFE') return '🔪';
    if (w === 'SMG') return 'cx';
    return 'rifle'; // Ícone padrão
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e5e7eb' }}>
      
      {/* Lado Esquerdo: Tempo e Killer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'monospace', color: '#6b7280', minWidth: '30px' }}>
          {formatTime(event.timeInRound)}
        </span>
        <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>
          {event.killer.nickname}
        </span>
      </div>

      {/* Centro: Arma e Ícones de Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
        {event.wasFlashed && <span title="Cego">😵</span>}
        {event.throughSmoke && <span title="Varado na Smoke">💨</span>}
        
        <span>[{getWeaponIcon(event.weapon)}]</span>
        
        {event.isHeadshot && <span style={{ color: '#ef4444' }} title="Headshot">⌖</span>}
      </div>

      {/* Lado Direito: Vítima e Posição */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#f87171' }}>
          {event.victim.nickname}
        </span>
        {event.position && (
          <span style={{ 
            fontSize: '10px', 
            padding: '1px 4px', 
            borderRadius: '4px', 
            backgroundColor: '#374151',
            color: '#d1d5db'
          }}>
            {event.position}
          </span>
        )}
      </div>
    </div>
  );
};