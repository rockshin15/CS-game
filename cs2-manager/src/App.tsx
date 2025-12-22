// src/App.tsx
import React, { useState } from 'react';
import { MainMenu } from './ui/screens/MainMenu';
import { MatchTestScreen } from './ui/screens/MatchTestScreen';
import { TeamTestScreen } from './ui/screens/TeamTestScreen'; // Se quiser acessar a criação de times

// Definindo as telas possíveis
type Screen = 'MENU' | 'MATCH_TEST' | 'NEW_LEAGUE' | 'TEAM_TEST';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MENU');

  // Lógica para quando clicar em "Nova Liga"
  const handleStartNew = () => {
    console.log("Iniciando nova liga...");
    // Por enquanto, vou redirecionar para sua tela de teste de partida
    setCurrentScreen('MATCH_TEST');
  };

  // Lógica para carregar um save
  const handleLoadSave = (id: string) => {
    console.log(`Carregando save ${id}...`);
    setCurrentScreen('MATCH_TEST');
  };

  // Renderização condicional das telas
  return (
    <>
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
    </>
  );
}