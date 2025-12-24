import React, { useState, useContext } from 'react';

// Telas
import { MainMenu } from './ui/screens/MainMenu';
import { MatchTestScreen } from './ui/screens/MatchTestScreen';
import { TeamTestScreen } from './ui/screens/TeamTestScreen'; 
import CalendarScreen from './ui/screens/CalendarScreen'; 
import { TeamSelectionScreen, type JsonTeam } from './ui/screens/TeamSelectionScreen'; 
import { HubScreen } from './ui/screens/HubScreen';
import { TournamentScreen } from './ui/screens/TournamentScreen';

// Contexto
// GameProvider vem do arquivo com a lógica (GameContext.tsx)
import { GameProvider } from './ui/context/GameContext';
// GameContext vem do arquivo de definições/valores (GameContextVals.ts)
import { GameContext } from './ui/context/GameContextVals';

// Tipos de navegação
type Screen = 
  | 'MENU' 
  | 'MATCH_TEST' 
  | 'TEAM_TEST' 
  | 'TEAM_SELECTION' 
  | 'HUB' 
  | 'CALENDAR' 
  | 'TOURNAMENT';

// Componente Wrapper interno para consumir o Contexto
const GameApp = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MENU');
  
  // Acesso ao contexto para setar o time
  const gameContext = useContext(GameContext);

  const handleStartNew = () => {
    setCurrentScreen('TEAM_SELECTION');
  };

  const handleLoadSave = (id: string) => {
    console.log(`Carregando save ${id}...`);
    // Exemplo: poderia carregar dados e ir direto pro HUB
    setCurrentScreen('HUB'); 
  };

  const handleTeamChosen = (team: JsonTeam) => {
    console.log("Time selecionado:", team.name);
    // 1. Salva o time no estado global
    gameContext?.setPlayerTeam(team);
    // 2. Vai para o Hub
    setCurrentScreen('HUB');
  };

  // Navegação vinda do HubScreen
  const handleHubNavigation = (target: string) => {
    if (target === 'CALENDAR') {
      setCurrentScreen('CALENDAR');
    }
    if (target === 'TOURNAMENT') {
      setCurrentScreen('TOURNAMENT');
    }
    // Adicione outras rotas aqui conforme criar as telas (ex: 'FINANCE', 'TRAINING')
  };

  return (
      <>
      {/* 1. MENU PRINCIPAL */}
      {currentScreen === 'MENU' && (
        <MainMenu 
          onStartNew={handleStartNew} 
          onLoadSave={handleLoadSave} 
        />
      )}

      {/* 2. SELEÇÃO DE TIME */}
      {currentScreen === 'TEAM_SELECTION' && (
        <TeamSelectionScreen 
            onTeamSelected={handleTeamChosen}
            onBack={() => setCurrentScreen('MENU')}
        />
      )}

      {/* 3. HUB (TELA PRINCIPAL DE GERENCIAMENTO) */}
      {currentScreen === 'HUB' && (
        <HubScreen onNavigate={handleHubNavigation} />
      )}

      {/* 4. CALENDÁRIO */}
      {currentScreen === 'CALENDAR' && (
        <div style={{ height: '100vh', width: '100vw' }}>
          {/* Botão flutuante para voltar ao HUB */}
          <button 
            onClick={() => setCurrentScreen('HUB')}
            style={backButtonStyle}
          >
            ⬅ Voltar ao Hub
          </button>
          <CalendarScreen />
        </div>
      )}

      {/* 5. TORNEIO */}
      {currentScreen === 'TOURNAMENT' && (
        <div style={{ height: '100vh', width: '100vw', background: '#111' }}>
          <button 
            onClick={() => setCurrentScreen('HUB')}
            style={backButtonStyle}
          >
            ⬅ Voltar ao Hub
          </button>
          <TournamentScreen />
        </div>
      )}

      {/* --- TELAS DE TESTE/DEV --- */}
      {currentScreen === 'MATCH_TEST' && (
        <div>
           <button onClick={() => setCurrentScreen('MENU')} style={{ padding: 10 }}>⬅ Voltar Menu</button>
           <MatchTestScreen />
        </div>
      )}
      
      {currentScreen === 'TEAM_TEST' && (
        <div>
          <button onClick={() => setCurrentScreen('MENU')} style={{ padding: 10 }}>⬅ Voltar Menu</button>
          <TeamTestScreen />
        </div>
      )}
      </> 
  );
};

// Estilo reutilizável para o botão de voltar
const backButtonStyle: React.CSSProperties = {
  position: 'fixed', 
  top: 10, 
  right: 10, 
  zIndex: 1000,
  padding: '8px 16px',
  backgroundColor: '#334155',
  color: 'white',
  border: '1px solid #475569',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}