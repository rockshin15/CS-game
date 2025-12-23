// src/ui/screens/TournamentScreen.tsx
import React, { useContext } from 'react';
import { GameContext } from '../context/GameContextVals';

const styles = {
  container: { padding: '20px', color: '#fff' },
  header: { borderBottom: '1px solid #444', marginBottom: '20px', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { background: '#2a2a2a', padding: '15px', borderRadius: '8px' },
  matchItem: { display: 'flex', justifyContent: 'space-between', background: '#333', padding: '10px', margin: '5px 0', borderRadius: '4px' },
  button: { background: '#d32f2f', color: '#fff', border: 'none', padding: '15px 30px', fontSize: '16px', cursor: 'pointer', marginTop: '20px', borderRadius: '4px', width: '100%' }
};

export const TournamentScreen: React.FC = () => {
  const game = useContext(GameContext);

  if (!game || !game.state.activeTournament) {
    return (
      <div style={styles.container}>
        <h2>Nenhum torneio ativo no momento.</h2>
        <p>Avance a semana para encontrar novos eventos.</p>
      </div>
    );
  }

  const { activeTournament, currentMatches } = game.state;
  const { swissStandings } = activeTournament;

  // --- ALTERAÇÃO AQUI ---
  // Agora usamos a função real do Contexto que roda a MatchEngine
  const handleSimulateRound = () => {
    game.simulateWeek();
  };
  // ---------------------

  // Prepara a lista de classificação para exibição
  const sortedStandings = swissStandings
    ? Object.entries(swissStandings)
        .map(([teamId, record]) => {
          const team = activeTournament.participants.find(p => p.id === teamId);
          return { team, ...record };
        })
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return a.losses - b.losses;
        })
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>{activeTournament.name}</h1>
        <h3>Formato: {activeTournament.format} | Rodada {activeTournament.currentRound} / {activeTournament.totalRounds}</h3>
      </div>

      <div style={styles.grid}>
        {/* COLUNA 1: Classificação (Apenas se for Suíço) */}
        {activeTournament.format === 'SWISS' && (
          <div style={styles.card}>
            <h3>Classificação</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #555' }}>
                  <th>Time</th>
                  <th>W</th>
                  <th>L</th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((row, index) => (
                  <tr key={row.team?.id || `standing-${index}`} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '8px' }}>{row.team?.name || 'Unknown'}</td>
                    <td style={{ color: '#4caf50' }}>{row.wins}</td>
                    <td style={{ color: '#f44336' }}>{row.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COLUNA 2: Próximos Jogos */}
        <div style={styles.card}>
          <h3>Jogos da Rodada</h3>
          {currentMatches.length === 0 ? (
            <p>Aguardando próxima fase ou torneio finalizado.</p>
          ) : (
            currentMatches.map((match, index) => (
              <div key={index} style={styles.matchItem}>
                <span>{match.teamA.name}</span>
                <span style={{ color: '#888' }}>vs</span>
                <span>{match.teamB.name}</span>
              </div>
            ))
          )}
          
          {/* Só mostra o botão se houver jogos para simular */}
          {currentMatches.length > 0 && (
            <button style={styles.button} onClick={handleSimulateRound}>
              SIMULAR RODADA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};