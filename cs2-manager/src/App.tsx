// src/App.tsx
import React, { useState } from 'react';
import { MainMenu } from './ui/screens/MainMenu';
import { MatchTestScreen } from './ui/screens/MatchTestScreen';
import { TeamTestScreen } from './ui/screens/TeamTestScreen'; 
import CalendarScreen from './ui/screens/CalendarScreen'; // Novo Import
import { GameProvider } from './ui/context/GameContext';  // Novo Import (Essencial)

// Definindo as telas possíveis (Adicionado CALENDAR)
type Screen = 'MENU' | 'MATCH_TEST' | 'NEW_LEAGUE' | 'TEAM_TEST' | 'CALENDAR';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MENU');

  // Lógica para quando clicar em "Nova Liga"
  const handleStartNew = () => {
    console.log("Iniciando nova liga...");
    // Redirecionando para o Calendário para testar o novo motor
    setCurrentScreen('CALENDAR');
  };

  // Lógica para carregar um save
  const handleLoadSave = (id: string) => {
    console.log(`Carregando save ${id}...`);
    setCurrentScreen('MATCH_TEST');
  };

  return (
    // O Provider precisa envolver tudo para o estado do jogo persistir entre telas
    <GameProvider>
      
      {currentScreen === 'MENU' && (
        <MainMenu 
          onStartNew={handleStartNew} 
          onLoadSave={handleLoadSave} 
        />
      )}

      {currentScreen === 'MATCH_TEST' && (
        <div>
           {/* Botãozinho temporário para voltar ao menu */}
           <button 
             onClick={() => setCurrentScreen('MENU')}
             style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}
           >
             ⬅ Voltar ao Menu
           </button>
           <MatchTestScreen />
        </div>
      )}

      {currentScreen === 'TEAM_TEST' && (
        <div>
          <button 
            onClick={() => setCurrentScreen('MENU')}
            style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}
          >
            ⬅ Voltar ao Menu
          </button>
          <TeamTestScreen />
        </div>
      )}

      {/* Nova Rota do Calendário */}
      {currentScreen === 'CALENDAR' && (
        <div style={{ height: '100vh', width: '100vw' }}>
          <button 
            onClick={() => setCurrentScreen('MENU')}
            style={{ 
              position: 'fixed', 
              top: 10, 
              right: 10, // Coloquei na direita para não tapar o header do calendário
              zIndex: 1000,
              padding: '8px 16px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              cursor: 'pointer'
            }}
          >
            ⬅ Voltar ao Menu
          </button>
          <CalendarScreen />
        </div>
      )}

    </GameProvider>
  );
}