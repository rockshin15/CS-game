// src/ui/screens/TournamentScreen.tsx
import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContextVals';
import type { MatchResult } from '../../core/types/MatchTypes';

// Estilos (Mantidos iguais)
const styles = {
  container: { padding: '24px', color: '#e0e0e0', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' },
  heroSection: { background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  grid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' },
  card: { background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' },
  matchRow: { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #2a2a2a', alignItems: 'center' },
  versus: { fontSize: '24px', fontWeight: 'bold', color: '#888', margin: '0 20px' },
  simulateBtn: { background: '#2196f3', color: 'white', border: 'none', padding: '15px 40px', fontSize: '18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', transition: 'background 0.2s' },
  standingRow: (isUser: boolean) => ({
    display: 'grid', gridTemplateColumns: '30px 1fr 40px 40px', padding: '8px', 
    background: isUser ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
    borderLeft: isUser ? '4px solid #2196f3' : '4px solid transparent'
  }),
  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#1e1e1e', width: '800px', maxHeight: '90vh', overflowY: 'auto' as const, borderRadius: '12px', padding: '30px', boxShadow: '0 0 30px rgba(0,0,0,0.7)', border: '1px solid #333' },
  scoreBoard: { display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 'bold', margin: '20px 0', gap: '20px' },
  roundLog: { marginTop: '20px', textAlign: 'left' as const, background: '#111', padding: '15px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' as const, fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6' }
};

export const TournamentScreen: React.FC = () => {
  const game = useContext(GameContext);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!game || !game.state.activeTournament) {
    return <div style={styles.container}><h2>Sem torneios ativos.</h2></div>;
  }

  const { activeTournament, currentMatches, userTeam, lastMatchResult } = game.state;
  const { swissStandings } = activeTournament;

  const userMatch = currentMatches.find(
    m => m.teamA.id === userTeam?.id || m.teamB.id === userTeam?.id
  );

  const handleSimulate = async () => {
    setIsSimulating(true);
    setTimeout(() => {
        game.simulateWeek();
        setIsSimulating(false);
    }, 1000);
  };

  if (lastMatchResult) {
    return (
        <MatchResultView 
            result={lastMatchResult} 
            userTeamId={userTeam?.id || ''}
            onClose={game.clearLastMatchResult} 
        />
    );
  }

  const sortedStandings = swissStandings
    ? Object.entries(swissStandings)
        .map(([teamId, record]) => ({ 
            team: activeTournament.participants.find(p => p.id === teamId), 
            ...record 
        }))
        .sort((a, b) => (b.wins - a.wins) || (a.losses - b.losses))
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
            <h1 style={{margin: 0}}>{activeTournament.name}</h1>
            <span style={{color: '#888'}}>Rodada {activeTournament.currentRound} de {activeTournament.totalRounds} • {activeTournament.format}</span>
        </div>
        <div>
            <span style={{background: '#333', padding: '5px 12px', borderRadius: '15px', fontSize: '0.9em'}}>
                {activeTournament.isFinished ? 'Finalizado' : 'Em Andamento'}
            </span>
        </div>
      </div>

      {userMatch ? (
        <div style={styles.heroSection}>
            <h3 style={{marginTop: 0, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px'}}>Sua Próxima Partida</h3>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0'}}>
                <div style={{textAlign: 'right', flex: 1}}>
                    <div style={{fontSize: '28px', fontWeight: 'bold'}}>{userMatch.teamA.name}</div>
                    {/* CORREÇÃO AQUI: Substituído 'any' por tipagem explícita opcional */}
                    <div style={{color: '#888'}}>Rank #{(userMatch.teamA as { rank?: number }).rank || '-'}</div>
                </div>
                
                <div style={styles.versus}>VS</div>
                
                <div style={{textAlign: 'left', flex: 1}}>
                    <div style={{fontSize: '28px', fontWeight: 'bold'}}>{userMatch.teamB.name}</div>
                    {/* CORREÇÃO AQUI: Substituído 'any' por tipagem explícita opcional */}
                    <div style={{color: '#888'}}>Rank #{(userMatch.teamB as { rank?: number }).rank || '-'}</div>
                </div>
            </div>
            
            <div style={{textAlign: 'center'}}>
                <button 
                    style={{...styles.simulateBtn, opacity: isSimulating ? 0.7 : 1}} 
                    onClick={handleSimulate}
                    disabled={isSimulating}
                >
                    {isSimulating ? 'SIMULANDO RODADA...' : 'JOGAR PARTIDA'}
                </button>
            </div>
        </div>
      ) : (
        currentMatches.length > 0 && (
            <div style={styles.heroSection}>
                 <h3 style={{marginTop: 0}}>Você está de folga nesta rodada (Bye) ou foi eliminado.</h3>
                 <button style={styles.simulateBtn} onClick={handleSimulate}>SIMULAR RESTANTE</button>
            </div>
        )
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={{borderBottom: '1px solid #333', paddingBottom: '10px'}}>Classificação</h3>
          <div style={{fontSize: '0.9em', color: '#888', display: 'grid', gridTemplateColumns: '30px 1fr 40px 40px', padding: '5px'}}>
            <span>#</span><span>Time</span><span>V</span><span>D</span>
          </div>
          {sortedStandings.map((row, index) => {
             const isUser = row.team?.id === userTeam?.id;
             let statusColor = '#fff';
             if (row.wins >= 3) statusColor = '#4caf50';
             if (row.losses >= 3) statusColor = '#f44336';

             return (
              <div key={index} style={{...styles.standingRow(isUser), color: statusColor}}>
                <span>{index + 1}</span>
                <span style={{fontWeight: isUser ? 'bold' : 'normal'}}>{row.team?.name || 'Unknown'}</span>
                <span>{row.wins}</span>
                <span>{row.losses}</span>
              </div>
            );
          })}
        </div>

        <div style={styles.card}>
          <h3 style={{borderBottom: '1px solid #333', paddingBottom: '10px'}}>Todos os Jogos da Rodada</h3>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {currentMatches.map((match, idx) => (
                <div key={idx} style={styles.matchRow}>
                    <span style={{width: '40%', textAlign: 'right'}}>{match.teamA.name}</span>
                    <span style={{color: '#555', fontSize: '0.8em', padding: '0 10px'}}>vs</span>
                    <span style={{width: '40%', textAlign: 'left'}}>{match.teamB.name}</span>
                </div>
            ))}
            {currentMatches.length === 0 && <p style={{textAlign: 'center', color: '#666'}}>Aguardando sorteio.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchResultView = ({ result, userTeamId, onClose }: { result: MatchResult, userTeamId: string, onClose: () => void }) => {
    const userWon = result.winnerId === userTeamId;
    const resultColor = userWon ? '#4caf50' : '#f44336';
    
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={{textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '20px'}}>
                    <h2 style={{margin: 0, color: resultColor, fontSize: '2rem'}}>
                        {userWon ? 'VITÓRIA' : 'DERROTA'}
                    </h2>
                    <p style={{color: '#888'}}>Mapa: {result.mapName}</p>
                </div>

                <div style={styles.scoreBoard}>
                    <span style={{color: result.scoreA > result.scoreB ? '#4caf50' : '#fff'}}>
                        {result.scoreA}
                    </span>
                    <span style={{fontSize: '1.5rem', color: '#666'}}>-</span>
                    <span style={{color: result.scoreB > result.scoreA ? '#4caf50' : '#fff'}}>
                        {result.scoreB}
                    </span>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <h3 style={{color: '#fff'}}>Resumo da Partida</h3>
                    <div style={styles.roundLog}>
                        {result.rounds && result.rounds.length > 0 ? (
                            result.rounds.map((round, idx) => (
                                <div key={idx} style={{marginBottom: '8px', borderBottom: '1px solid #222', paddingBottom: '4px'}}>
                                    <span style={{color: '#2196f3', fontWeight: 'bold'}}>Round {round.roundNumber}: </span>
                                    <span>{round.message}</span>
                                </div>
                            ))
                        ) : (
                            <p>Detalhes da partida não disponíveis.</p>
                        )}
                    </div>
                </div>

                <div style={{textAlign: 'center', marginTop: '30px'}}>
                    <button onClick={onClose} style={styles.simulateBtn}>
                        CONTINUAR
                    </button>
                </div>
            </div>
        </div>
    );
};