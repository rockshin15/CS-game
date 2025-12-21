// src/ui/screens/TeamTestScreen.tsx

import React, { useState } from 'react';
import { Team } from '../../core/classes/Team';
import type { TeamTier } from '../../core/types/TeamTypes';

export const TeamTestScreen: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  const handleGenerateTeam = () => {
    const tiers: TeamTier[] = ['S', 'A', 'B', 'C'];
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
    
    // Passamos os nomes que já existem na tela para o gerador não repetir
    const existingNames = teams.map(t => t.name);
    
    // Novo Construtor simplificado!
    const newTeam = new Team(randomTier, existingNames);

    setTeams([newTeam, ...teams]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1>🏢 Laboratório de Equipas v2</h1>
        <p>Testando: Nomes Reais, Cores Dinâmicas e Regiões</p>
        <button 
          onClick={handleGenerateTeam}
          style={{
            padding: '12px 24px', fontSize: '18px', cursor: 'pointer',
            backgroundColor: '#10b981', color: 'white', border: 'none',
            borderRadius: '6px', fontWeight: 'bold', marginTop: '10px'
          }}
        >
          + Criar Equipa Aleatória
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {teams.map((team) => (
          <div key={team.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#fff',
            overflow: 'hidden', // Importante para o banner
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Banner com a cor do time */}
            <div style={{
                height: '60px',
                backgroundColor: team.colors.primary,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                justifyContent: 'space-between'
            }}>
                <h2 style={{ margin: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {team.name}
                </h2>
                <span style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {team.shortName}
                </span>
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                     {/* Badge de Região */}
                     <span style={{ fontSize: '14px', color: '#6b7280' }}>📍 {team.region}</span>
                     {/* Badge de Tier */}
                     <span style={{ 
                         backgroundColor: getTierColor(team.tier), 
                         color: 'white', padding: '2px 8px', 
                         borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                     }}>
                         Tier {team.tier}
                     </span>
                </div>

                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>💰 Orçamento:</span>
                        <span style={{ fontWeight: 'bold', color: '#059669' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(team.budget)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                         <span>🧠 Estratégia:</span>
                         <span style={{ fontWeight: 'bold', color: '#4b5563' }}>{team.strategy}</span>
                    </div>
                </div>

                {/* Map Pool Miniatura */}
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '5px' }}>
                    Melhores Mapas
                </h3>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {Object.entries(team.mapPool)
                        .sort(([,a], [,b]) => b - a) // Ordena pelos melhores
                        .slice(0, 3) // Pega só o Top 3
                        .map(([mapName, value]) => (
                        <span key={mapName} style={{ 
                            fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: value > 80 ? '#d1fae5' : '#fef3c7',
                            color: value > 80 ? '#065f46' : '#92400e',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            {mapName} ({value})
                        </span>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getTierColor = (tier: string) => {
    switch(tier) {
        case 'S': return '#d97706'; 
        case 'A': return '#3b82f6'; 
        case 'B': return '#8b5cf6'; 
        case 'C': return '#6b7280'; 
        default: return '#000';
    }
}