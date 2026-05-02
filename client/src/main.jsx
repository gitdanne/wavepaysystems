import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BankProvider } from './state/BankContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BankProvider>
      <App />
    </BankProvider>
  </StrictMode>,
)
