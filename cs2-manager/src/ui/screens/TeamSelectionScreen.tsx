// src/ui/screens/TeamSelectionScreen.tsx
import React, { useState } from 'react';
import realTeams from '../../data/realTeams.json';
import { Button } from '../components/Button';

// --- DEFINIÇÃO DE TIPOS DO JSON ---
// Precisamos definir isso pois o JSON tem chaves diferentes dos tipos internos do jogo
// (ex: 'spray' no JSON vs 'sprayControl' no PlayerAttributes)

export interface JsonPlayerStats {
    aim: number;
    reflexes: number;
    spray: number;
    sense: number;
    util: number;
    disc: number;
}

export interface JsonPlayer {
    nickname: string;
    country: string;
    role: string;
    age: number;
    stats: JsonPlayerStats;
}

export interface JsonTeam {
    id: string;
    name: string;
    shortName: string;
    region: string;
    tier: string;
    colors: { primary: string; secondary: string };
    strategy: string;
    playStyle: string;
    roster: JsonPlayer[];
}

// --- FIM DOS TIPOS ---

interface TeamSelectionScreenProps {
    onTeamSelected: (team: JsonTeam) => void; // Tipo corrigido (antes era any)
    onBack: () => void;
}

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({ onTeamSelected, onBack }) => {
    
    // --- CORREÇÃO DE DADOS (SEM 'ANY') ---
    // Criamos um tipo local que diz: "O dado bruto é igual ao JsonTeam, mas o ID é opcional"
    type RawTeamData = Omit<JsonTeam, 'id'> & { id?: string };

    // Agora o TypeScript sabe exatamente o que esperar do JSON, sem usar 'any'
    const teamsData = (realTeams as unknown as RawTeamData[]).map(team => ({
        ...team,
        // Se o ID não existir no JSON, usa o nome como fallback
        id: team.id || team.name 
    })) as JsonTeam[];
    
    const [selectedTeam, setSelectedTeam] = useState<JsonTeam>(teamsData[0]);
    const calculateOverall = (stats: JsonPlayerStats) => {
        const { aim, reflexes, spray, sense, util, disc } = stats;
        return Math.floor((aim + reflexes + spray + sense + util + disc) / 6);
    };

    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            width: '100vw',
            backgroundColor: '#0f172a', 
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            
            {/* --- BARRA LATERAL (LISTA DE TIMES) --- */}
            <div style={{ 
                width: '320px', 
                backgroundColor: '#111827', 
                borderRight: '1px solid #1e293b', 
                display: 'flex', 
                flexDirection: 'column' 
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Escolha seu Time</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        {teamsData.length} times disponíveis
                    </p>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {teamsData.map((team, index) => (
                        <div 
                            key={index}
                            onClick={() => setSelectedTeam(team)}
                            style={{
                                padding: '16px 20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: selectedTeam.name === team.name ? '#1e293b' : 'transparent',
                                borderLeft: selectedTeam.name === team.name 
                                    ? `4px solid ${team.colors.primary}` 
                                    : '4px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{
                                width: '12px', 
                                height: '12px', 
                                borderRadius: '50%', 
                                backgroundColor: team.colors.primary,
                                boxShadow: `0 0 8px ${team.colors.primary}`
                            }}/>
                            
                            <div>
                                <div style={{ fontWeight: 'bold', color: selectedTeam.name === team.name ? '#fff' : '#94a3b8' }}>
                                    {team.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                                    Tier {team.tier} • {team.region}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PAINEL PRINCIPAL (DETALHES) --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                
                {/* Cabeçalho do Time */}
                <div style={{ 
                    padding: '40px', 
                    background: `linear-gradient(to right, #1e293b, #0f172a)`,
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                             <h1 style={{ 
                                 margin: 0, 
                                 fontSize: '3rem', 
                                 color: selectedTeam.colors.primary,
                                 textShadow: '0 0 20px rgba(0,0,0,0.5)'
                             }}>
                                 {selectedTeam.name}
                             </h1>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Badge label={selectedTeam.region} />
                            <Badge label={`Tier ${selectedTeam.tier}`} color={getTierColor(selectedTeam.tier)} />
                            <Badge label={selectedTeam.strategy} color="#64748b" />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Estilo de Jogo</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{selectedTeam.playStyle}</div>
                    </div>
                </div>

                {/* Conteúdo: Elenco */}
                <div style={{ padding: '40px', flex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff', fontSize: '1.5rem' }}>Elenco Atual</h3>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {selectedTeam.roster.map((player: JsonPlayer) => { // Tipo explícito aqui
                            const overall = calculateOverall(player.stats);
                            return (
                                <div key={player.nickname} style={{ 
                                    backgroundColor: '#1e293b', 
                                    padding: '20px', 
                                    borderRadius: '12px',
                                    border: '1px solid #334155',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{player.nickname}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{player.country}</span>
                                    </div>
                                    
                                    <div style={{ 
                                        color: '#06b6d4', 
                                        fontWeight: '600', 
                                        fontSize: '0.9rem', 
                                        marginBottom: '15px',
                                        textTransform: 'uppercase' 
                                    }}>
                                        {player.role}
                                    </div>

                                    <div style={{ 
                                        backgroundColor: 'rgba(0,0,0,0.3)', 
                                        padding: '8px 12px', 
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>RATING</span>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            fontSize: '1.1rem',
                                            color: overall >= 90 ? '#fbbf24' : (overall >= 80 ? '#fff' : '#94a3b8')
                                        }}>
                                            {overall}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Rodapé com Ações */}
                <div style={{ 
                    padding: '20px 40px', 
                    borderTop: '1px solid #334155', 
                    backgroundColor: '#111827',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '20px'
                }}>
                    <Button onClick={onBack} style={{ backgroundColor: '#334155', padding: '15px 30px' }}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={() => onTeamSelected(selectedTeam)} 
                        style={{ 
                            padding: '15px 40px', 
                            fontSize: '1.1rem',
                            backgroundColor: '#06b6d4',
                            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                        }}
                    >
                        Confirmar e Iniciar com {selectedTeam.shortName}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Componente Badge
const Badge = ({ label, color = '#334155' }: { label: string, color?: string }) => (
    <span style={{ 
        backgroundColor: color, 
        color: '#fff', 
        padding: '6px 12px', 
        borderRadius: '6px', 
        fontSize: '0.85rem',
        fontWeight: '600',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
    }}>
        {label}
    </span>
);

const getTierColor = (tier: string) => {
    switch(tier) {
        case 'S': return '#eab308'; // Gold
        case 'A': return '#ef4444'; // Red
        case 'B': return '#3b82f6'; // Blue
        default: return '#64748b';
    }
};