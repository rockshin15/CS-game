// src/ui/screens/HubScreen.tsx
import React, { useContext } from 'react';
import { GameContext } from '../context/GameContextVals';
// Removi o import do Button que não estava sendo usado
// Importamos o tipo das estatísticas para evitar o "any"
import type { JsonPlayerStats } from './TeamSelectionScreen';

interface HubScreenProps {
    onNavigate: (screen: string) => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({ onNavigate }) => {
    const context = useContext(GameContext);

    // Se por algum motivo o contexto não carregar, evitamos o crash
    if (!context || !context.state.userTeam) {
        return <div style={{ color: 'white', padding: 20 }}>Carregando dados do time...</div>;
    }

    const { userTeam, date } = context.state;

    // CORREÇÃO: Tipagem explícita aqui substituindo o 'any'
    const getOverall = (stats: JsonPlayerStats) => Math.floor((stats.aim + stats.reflexes + stats.spray + stats.sense + stats.util + stats.disc) / 6);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0f172a', color: '#e2e8f0', overflow: 'hidden' }}>
            
            {/* --- BARRA LATERAL (MENU) --- */}
            <div style={{ 
                width: '260px', 
                backgroundColor: '#111827', 
                borderRight: '1px solid #1e293b', 
                display: 'flex', 
                flexDirection: 'column',
                padding: '20px',
                gap: '15px'
            }}>
                <div style={{ marginBottom: '20px', textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}>Manager Hub</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        {date.week}ª Sem • {date.month} {date.year}
                    </p>
                </div>

                {/* Botões de Navegação */}
                <MenuButton label="📅 Calendário" onClick={() => onNavigate('CALENDAR')} active />
                <MenuButton label="💰 Finanças" onClick={() => {}} disabled />
                <MenuButton label="🕵️ Olheiro" onClick={() => {}} disabled />
                <MenuButton label="🏆 Campeonatos" onClick={() => {}} disabled />
                <MenuButton label="🏋️ Treino" onClick={() => {}} disabled />
            </div>

            {/* --- ÁREA PRINCIPAL --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                
                {/* Header do Time */}
                <div style={{ 
                    padding: '30px 40px', 
                    background: `linear-gradient(to right, #1e293b, #0f172a)`,
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ 
                            width: '60px', height: '60px', 
                            borderRadius: '50%', 
                            backgroundColor: userTeam.colors.primary,
                            boxShadow: `0 0 15px ${userTeam.colors.primary}`,
                            border: '2px solid #fff'
                        }} />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#fff' }}>{userTeam.name}</h1>
                            <span style={{ color: '#94a3b8', fontSize: '1rem' }}>Região: {userTeam.region} • Tier {userTeam.tier}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Orçamento Disponível</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>$ 50,000</div>
                    </div>
                </div>

                {/* Tabela do Roster */}
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Elenco Ativo</h3>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{userTeam.roster.length} Jogadores</span>
                    </div>

                    <div style={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        border: '1px solid #334155',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    <th style={thStyle}>Nickname</th>
                                    <th style={thStyle}>Role</th>
                                    <th style={thStyle}>Idade</th>
                                    <th style={thStyle}>Rating Geral</th>
                                    <th style={thStyle}>Aim</th>
                                    <th style={thStyle}>Reflex</th>
                                    <th style={thStyle}>Sense</th>
                                    <th style={thStyle}>Util</th>
                                    <th style={thStyle}>K/D (Sim)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userTeam.roster.map((player, index) => {
                                    const overall = getOverall(player.stats);
                                    return (
                                        <tr key={index} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={tdStyle}>
                                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{player.nickname}</span>
                                                <br/>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{player.country}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                                                    backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4'
                                                }}>
                                                    {player.role}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, color: '#cbd5e1' }}>{player.age}</td>
                                            <td style={tdStyle}>
                                                <div style={{ 
                                                    width: '35px', height: '35px', borderRadius: '6px', 
                                                    backgroundColor: overall >= 90 ? '#eab308' : '#334155',
                                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {overall}
                                                </div>
                                            </td>
                                            {/* Atributos Específicos */}
                                            <td style={{ ...tdStyle, color: '#94a3b8' }}>{player.stats.aim}</td>
                                            <td style={{ ...tdStyle, color: '#94a3b8' }}>{player.stats.reflexes}</td>
                                            <td style={{ ...tdStyle, color: '#94a3b8' }}>{player.stats.sense}</td>
                                            <td style={{ ...tdStyle, color: '#94a3b8' }}>{player.stats.util}</td>
                                            <td style={{ ...tdStyle, fontWeight: 'bold', color: '#fff' }}>
                                                {/* Placeholder para K/D, já que a simulação ainda não rodou */}
                                                0.00
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Estilos Auxiliares e Componentes Locais ---

const thStyle: React.CSSProperties = { padding: '16px 24px', fontWeight: '600' };
const tdStyle: React.CSSProperties = { padding: '16px 24px' };

const MenuButton = ({ label, onClick, disabled, active }: { label: string, onClick: () => void, disabled?: boolean, active?: boolean }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        style={{
            width: '100%',
            padding: '12px 16px',
            textAlign: 'left',
            backgroundColor: active ? '#1e293b' : 'transparent',
            border: active ? '1px solid #334155' : '1px solid transparent',
            color: disabled ? '#475569' : (active ? '#fff' : '#cbd5e1'),
            borderRadius: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: active ? 'bold' : 'normal',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}
    >
        {label}
        {disabled && <span style={{ fontSize: '0.6rem', padding: '2px 4px', backgroundColor: '#334155', borderRadius: '3px', marginLeft: 'auto' }}>WIP</span>}
    </button>
);