// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// Certifique-se que o nome do arquivo está correto (Maiúsculas/Minúsculas)
import { PlayerTestScreen } from './ui/screens/playertestscreen'

// REMOVIDO: import "./index.css"; <--- Essa linha causava o erro

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PlayerTestScreen />
  </React.StrictMode>,
)