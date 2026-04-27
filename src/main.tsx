import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Re-render banner cez window event keď SW signalizuje aktualizáciu.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onRegisterError(error: unknown) {
    console.warn('SW registration error', error);
  },
});

// Globálne dostupné — App.tsx tlačidlo „Obnoviť" zavolá toto.
;(window as unknown as { __pwaUpdate?: () => void }).__pwaUpdate = () => {
  updateSW(true);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
