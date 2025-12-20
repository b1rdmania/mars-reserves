import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from './providers/PrivyProvider.tsx'
import { GameSessionProvider } from './hooks/useGameSession.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider>
      <GameSessionProvider>
        <App />
      </GameSessionProvider>
    </PrivyProvider>
  </StrictMode>,
)

