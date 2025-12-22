import React, { useState, useContext } from 'react';
import { MainMenu } from './ui/screens/MainMenu';
import { MatchTestScreen } from './ui/screens/MatchTestScreen';
import { TeamTestScreen } from './ui/screens/TeamTestScreen'; 
import CalendarScreen from './ui/screens/CalendarScreen'; 
import { TeamSelectionScreen, type JsonTeam } from './ui/screens/TeamSelectionScreen'; 
import { HubScreen } from './ui/screens/HubScreen';

// MUDE AQUI: Importe GameProvider do arquivo original e GameContext do novo arquivo
import { GameProvider } from './ui/context/GameContext';
import { GameContext } from './ui/context/GameContextVals';

// Adicione HUB na lista
type Screen = 'MENU' | 'MATCH_TEST' | 'NEW_LEAGUE' | 'TEAM_TEST' | 'CALENDAR' | 'TEAM_SELECTION' | 'HUB';

// Componente Wrapper interno para poder usar o useContext dentro do App
const GameApp = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MENU');
  
  // Pegamos a função de setar o time do contexto
  const gameContext = useContext(GameContext);

  const handleStartNew = () => {
    setCurrentScreen('TEAM_SELECTION');
  };

  const handleLoadSave = (id: string) => {
    console.log(`Carregando save ${id}...`);
    setCurrentScreen('MATCH_TEST');
  };

  const handleTeamChosen = (team: JsonTeam) => {
    console.log("Time selecionado:", team.name);
    // 1. Salva o time no estado global
    gameContext?.setPlayerTeam(team);
    // 2. Vai para o Hub (não para o calendário direto)
    setCurrentScreen('HUB');
  };

  // Navegação vinda do Hub
  const handleHubNavigation = (target: string) => {
    if (target === 'CALENDAR') setCurrentScreen('CALENDAR');
    // Futuros: if (target === 'FINANCE') ...
  };

  return (
      <>
      {currentScreen === 'MENU' && (
        <MainMenu 
          onStartNew={handleStartNew} 
          onLoadSave={handleLoadSave} 
        />
      )}

      {currentScreen === 'TEAM_SELECTION' && (
        <TeamSelectionScreen 
            onTeamSelected={handleTeamChosen}
            onBack={() => setCurrentScreen('MENU')}
        />
      )}

      {/* NOVA TELA: HUB */}
      {currentScreen === 'HUB' && (
        <HubScreen onNavigate={handleHubNavigation} />
      )}

      {currentScreen === 'CALENDAR' && (
        <div style={{ height: '100vh', width: '100vw' }}>
          {/* Botão para voltar ao HUB, não ao Menu */}
          <button 
            onClick={() => setCurrentScreen('HUB')}
            style={{ 
              position: 'fixed', 
              top: 10, 
              right: 10, 
              zIndex: 1000,
              padding: '8px 16px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              cursor: 'pointer'
            }}
          >
            ⬅ Voltar ao Hub
          </button>
          <CalendarScreen />
        </div>
      )}

      {/* Telas de Teste */}
      {currentScreen === 'MATCH_TEST' && (
        <div>
           <button onClick={() => setCurrentScreen('MENU')} style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>⬅ Voltar</button>
           <MatchTestScreen />
        </div>
      )}

      {currentScreen === 'TEAM_TEST' && (
        <div>
          <button onClick={() => setCurrentScreen('MENU')} style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>⬅ Voltar</button>
          <TeamTestScreen />
        </div>
      )}
      </>
  );
}

// O App principal apenas provê o contexto
export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}