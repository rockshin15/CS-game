// src/ui/screens/PlayerTestScreen.tsx

import React, { useState } from 'react';
import { Player } from '../../core/classes/Player';

export const PlayerTestScreen: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const handleGenerate = () => {
    const newPlayer = new Player();
    setPlayers([newPlayer, ...players]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1>🧪 Laboratório de Geração (Fase 1 - Refinada)</h1>
        <p>Verificando lógica: Veteranos Inteligentes vs Jovens Rápidos</p>
        
        <button 
          onClick={handleGenerate}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          + Gerar Jogador
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {players.map((p) => (
          <div key={p.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Cabeçalho */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <h2 style={{ margin: '0', fontSize: '20px', color: '#111827' }}>{p.nickname}</h2>
                <span style={{ fontSize: '14px', color: p.age >= 29 ? '#b91c1c' : '#059669', fontWeight: 'bold' }}>
                  {p.age} anos {p.age >= 29 ? '(Vet)' : ''}
                </span>
              </div>
              <div style={{ fontSize: '32px' }} title={p.country}>{getFlagEmoji(p.country)}</div>
            </div>
            
            {/* Função e OVR */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <span style={{ 
                    backgroundColor: getRoleColor(p.role), color: 'white', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                }}>
                    {p.role}
                </span>
                <span style={{ 
                    backgroundColor: '#f3f4f6', color: '#374151', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                }}>
                    OVR: {p.overall}
                </span>
                <span style={{ 
                    backgroundColor: '#f3f4f6', color: '#374151', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                }}>
                    POT: {p.potential}
                </span>
            </div>

            {/* Atributos - Destaque para o que importa */}
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              <AttributeRow label="🎯 Aim" value={p.attributes.aim} highlight={p.attributes.aim >= 85} />
              <AttributeRow label="⚡ Reflexes" value={p.attributes.reflexes} highlight={p.attributes.reflexes >= 85} />
              <AttributeRow label="🧠 Sense" value={p.attributes.gameSense} highlight={p.attributes.gameSense >= 85} />
              <AttributeRow label="💣 Utility" value={p.attributes.utility} highlight={p.attributes.utility >= 80} />
              <AttributeRow label="🛡️ Discipline" value={p.attributes.discipline} highlight={p.attributes.discipline >= 80} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente auxiliar para linha de atributo
const AttributeRow = ({ label, value, highlight }: { label: string, value: number, highlight: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: highlight ? '#d97706' : 'inherit', fontWeight: highlight ? 'bold' : 'normal' }}>
      <span>{label}:</span> <strong>{value}</strong>
    </div>
);

// Cores para as funções
const getRoleColor = (role: string) => {
    switch(role) {
        case 'AWPer': return '#dc2626'; // Vermelho
        case 'IGL': return '#7c3aed';   // Roxo
        case 'Entry': return '#f59e0b'; // Laranja
        case 'Support': return '#10b981'; // Verde
        default: return '#3b82f6';      // Azul (Rifle/Lurker)
    }
}

// Lista completa de bandeiras baseada no countries.json
const getFlagEmoji = (countryCode: string): string => {
  const flags: { [key: string]: string } = {
    'BR': '🇧🇷', 'RU': '🇷🇺', 'DK': '🇩🇰', 'UA': '🇺🇦', 'FR': '🇫🇷',
    'SE': '🇸🇪', 'US': '🇺🇸', 'PL': '🇵🇱', 'DE': '🇩🇪', 'TR': '🇹🇷',
    'FI': '🇫🇮', 'AU': '🇦🇺', 'MN': '🇲🇳', 'CN': '🇨🇳', 'AR': '🇦🇷',
    'PT': '🇵🇹', 'ES': '🇪🇸', 'KZ': '🇰🇿', 'CA': '🇨🇦', 'NO': '🇳🇴',
    'UK': '🇬🇧', 'CZ': '🇨🇿', 'SK': '🇸🇰'
  };
  return flags[countryCode] || '🏳️';
};