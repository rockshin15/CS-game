// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// import { PlayerTestScreen } from './ui/screens/playertestscreen' // <--- Comente esta linha
import { TeamTestScreen } from './ui/screens/TeamTestScreen'    // <--- Adicione esta

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <PlayerTestScreen /> */} 
    <TeamTestScreen />  {/* <--- Renderize a nova tela */}
  </React.StrictMode>,
)