import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './styles/global.css'
import './styles/player.css'
import './styles/theme.css'
import './styles/scroll.css'
import './styles/worlds.css'
import './styles/jewel-catalog.css'
import './styles/production-lab.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
