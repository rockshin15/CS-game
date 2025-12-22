// src/App.tsx
// src/App.tsx
import React, { useState } from 'react';
import { MainMenu } from './ui/screens/MainMenu';
import { MatchTestScreen } from './ui/screens/MatchTestScreen';
import { TeamTestScreen } from './ui/screens/TeamTestScreen'; 
import CalendarScreen from './ui/screens/CalendarScreen'; 
// Importamos também o tipo JsonTeam
import { TeamSelectionScreen, type JsonTeam } from './ui/screens/TeamSelectionScreen'; 
import { GameProvider } from './ui/context/GameContext';

type Screen = 'MENU' | 'MATCH_TEST' | 'NEW_LEAGUE' | 'TEAM_TEST' | 'CALENDAR' | 'TEAM_SELECTION';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MENU');

  const handleStartNew = () => {
    setCurrentScreen('TEAM_SELECTION');
  };

  const handleLoadSave = (id: string) => {
    console.log(`Carregando save ${id}...`);
    setCurrentScreen('MATCH_TEST');
  };

  // Correção: Tipagem explícita no parâmetro 'team'
  const handleTeamChosen = (team: JsonTeam) => {
    console.log("Time selecionado para iniciar:", team.name);
    setCurrentScreen('CALENDAR');
  };

  return (
    <GameProvider>
      
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

      {currentScreen === 'CALENDAR' && (
        <div style={{ height: '100vh', width: '100vw' }}>
          <CalendarScreen />
        </div>
      )}

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

    </GameProvider>
  );
}