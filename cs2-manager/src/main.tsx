// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // <--- Importamos o novo App
import './ui/theme/theme.css' // Garantindo que o CSS global carregue (se não estiver importado no index.html)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> 
  </React.StrictMode>,
)