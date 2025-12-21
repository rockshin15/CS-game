// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// import { TeamTestScreen } from './ui/screens/TeamTestScreen' // <--- Comente o anterior
import { MatchTestScreen } from './ui/screens/MatchTestScreen'  // <--- Adicione este

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MatchTestScreen /> 
  </React.StrictMode>,
)