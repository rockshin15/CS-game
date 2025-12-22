import React, { useState } from 'react';
import { Team } from '../../core/classes/Team';
import { Player } from '../../core/classes/Player';
import { MatchEngine } from '../../core/classes/MatchEngine';
import type { MatchResult } from '../../core/types/MatchTypes';
// [Passo 4] Importação do novo componente
import { KillFeed } from '../components/KillFeed';

export const MatchTestScreen: React.FC = () => {
    // Estado para os dois times e o resultado
    const [teamA, setTeamA] = useState<Team | null>(null);
    const [teamB, setTeamB] = useState<Team | null>(null);
    const [result, setResult] = useState<MatchResult | null>(null);

    // Função para gerar um time completo e pronto para jogo
    const generateReadyTeam = (tier: 'S' | 'A' | 'B' | 'C') => {
        // Passamos nomes usados vazios ([]) por enquanto para simplificar o teste
        const t = new Team(tier, []);
        
        // Enche o time de jogadores (precisa de 5 titulares)
        for(let i=0; i<5; i++) t.addPlayer(new Player());
        
        return t;
    };

    const handleSimulate = () => {
        console.log("--- Iniciando Simulação ---");
        if (teamA && teamB) {
            try {
                // Passamos 'mirage' explicitamente
                // Isso ativa a lógica de Side Bias e a Economia no MatchEngine
                const matchResult = MatchEngine.simulateMatch(teamA, teamB, 'mirage');
                
                console.log("Resultado gerado com sucesso:", matchResult);
                setResult(matchResult);
            } catch (error) {
                console.error("ERRO CRÍTICO NA SIMULAÇÃO:", error);
                alert("Erro ao rodar simulação. Verifique o console (F12) para detalhes.");
            }
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>⚔️ Arena de Simulação (Economia v1)</h1>

            {/* ÁREA DOS TIMES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                
                {/* TIME A */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <button 
                        onClick={() => setTeamA(generateReadyTeam('S'))}
                        style={{ marginBottom: '10px', padding: '10px', width: '100%', cursor: 'pointer' }}
                    >
                        Gerar Time A (Tier S)
                    </button>
                    
                    {teamA && <TeamCard team={teamA} isWinner={result?.winnerId === teamA.id} score={result?.scoreA} />}
                </div>

                {/* VS */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '50px' }}>
                    <h2 style={{ fontSize: '40px', margin: 0 }}>VS</h2>
                    <span style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>Mapa: Mirage</span>
                    <button 
                        onClick={handleSimulate}
                        disabled={!teamA || !teamB}
                        style={{
                            marginTop: '20px',
                            padding: '15px 30px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            backgroundColor: (!teamA || !teamB) ? '#ccc' : '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (!teamA || !teamB) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        FIGHT!
                    </button>
                </div>

                {/* TIME B */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <button 
                        onClick={() => setTeamB(generateReadyTeam('B'))}
                        style={{ marginBottom: '10px', padding: '10px', width: '100%', cursor: 'pointer' }}
                    >
                        Gerar Time B (Tier B)
                    </button>
                    
                    {teamB && <TeamCard team={teamB} isWinner={result?.winnerId === teamB.id} score={result?.scoreB} />}
                </div>
            </div>

            {/* RESULTADO DETALHADO (NOVO LOG COM BADGES E KILLFEED) */}
            {result && (
                <div style={{ 
                    marginTop: '40px', 
                    padding: '20px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '12px',
                    border: '1px solid #d1d5db'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>
                        Histórico da Partida - {result.mapName}
                    </h3>
                    
                    {/* Lista de Rounds Scrollável */}
                    <div style={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto', 
                        backgroundColor: '#fff', 
                        borderRadius: '8px',
                        padding: '10px',
                        border: '1px solid #e5e7eb'
                    }}>
                        {/* [Passo 4] Substituição do map antigo pelo novo componente RoundRow */}
                        {result.rounds.map((round, index) => (
                            <RoundRow key={index} round={round} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTES AUXILIARES ---

// Componente visual simples para o time na arena
const TeamCard = ({ team, isWinner, score }: { team: Team, isWinner?: boolean, score?: number }) => (
    <div style={{ 
        border: isWinner ? '4px solid #10b981' : '1px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        opacity: (score !== undefined && !isWinner) ? 0.6 : 1
    }}>
        {/* Header Colorido */}
        <div style={{ backgroundColor: team.colors.primary, height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0 }}>{team.name}</h2>
        </div>

        {/* Info */}
        <div style={{ padding: '20px' }}>
            {score !== undefined && (
                <div style={{ fontSize: '60px', fontWeight: 'bold', color: isWinner ? '#10b981' : '#ef4444', marginBottom: '10px' }}>
                    {score}
                </div>
            )}
            
            <div style={{ marginBottom: '10px' }}>
                <strong>OVR Médio:</strong> {team.getAverageOverall()}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {team.roster.map(p => p.nickname).join(', ')}
            </div>
        </div>
    </div>
);

// Badge colorido para mostrar o tipo de compra (ECO/FORCE/FULL)
const LoadoutBadge = ({ type, label }: { type: string, label: string }) => {
    let color = '#22c55e'; // Verde (Full)
    let bg = '#f0fdf4';
    
    if (type === 'Force Buy') { color = '#eab308'; bg = '#fefce8'; } // Amarelo
    if (type === 'Eco' || type === 'Pistol') { color = '#ef4444'; bg = '#fef2f2'; } // Vermelho

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '55px' }}>
            <span style={{ 
                fontSize: '10px', 
                padding: '2px 4px', 
                borderRadius: '4px',
                border: `1px solid ${color}`, 
                color: color, 
                backgroundColor: bg,
                fontWeight: 'bold',
                width: '100%', 
                textAlign: 'center',
                display: 'block'
            }} title={type}>
                {/* Normaliza o texto para exibição */}
                {type === 'Full Buy' ? 'FULL' : type === 'Force Buy' ? 'FORCE' : type === 'Pistol' ? 'PISTOL' : 'ECO'}
            </span>
            <span style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
                {label}
            </span>
        </div>
    );
};

// [Passo 4] Componente auxiliar para linha de Round com Toggle
const RoundRow = ({ round }: { round: MatchResult['rounds'][number] }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (round.roundNumber === 0) {
        return (
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold', textAlign: 'center' }}>
                {round.message}
            </div>
        );
    }

    return (
        <div style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: isOpen ? '#f9fafb' : 'transparent' }}>
            {/* Linha de Resumo (Clicável) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    cursor: 'pointer'
                }}
            >
                <span style={{ fontWeight: 'bold', color: '#9ca3af', minWidth: '25px' }}>#{round.roundNumber}</span>
                <LoadoutBadge type={round.loadoutA} label={round.moneyA >= 10000 ? '$$$' : '$'} />

                <span style={{ flex: 1, textAlign: 'center', color: '#374151', display: 'flex', flexDirection: 'column' }}>
                    <span>{round.message}</span>
                    {isOpen ?
                        <span style={{ fontSize: '10px', color: '#ef4444' }}>Ocultar Detalhes ▲</span> :
                        <span style={{ fontSize: '10px', color: '#3b82f6' }}>Ver Kill Feed ▼</span>
                    }
                </span>

                <LoadoutBadge type={round.loadoutB} label={round.moneyB >= 10000 ? '$$$' : '$'} />
            </div>

            {/* Área Expandida: Kill Feed */}
            {isOpen && (
                <div style={{ padding: '0 15px 15px 15px' }}>
                    <KillFeed events={round.killFeed} />
                </div>
            )}
        </div>
    );
};