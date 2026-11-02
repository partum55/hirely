import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './demo/fetchMock' // no-op unless VITE_DEMO
import './index.css'
import './i18n/config'
import App from './App'
import AppProviders from './app/providers'

// start MSW in mock mode
if (import.meta.env.MODE === 'mock') {
  // dynamically import to avoid loading MSW in prod bundles
  import('./mocks/browser').then(({ startMockServiceWorker }) => startMockServiceWorker());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
