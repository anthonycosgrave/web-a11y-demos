import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import './index.css'
import App from './App.tsx'

// eBay MIND: pagination that changes the URL should update it.
// https://ebay.gitbook.io/mindpatterns/navigation/pagination
//
// BrowserRouter ties the app to the address bar, so every page 
// of results gets its own URL that can be bookmarked and shared, 
// and Back/Forward work. 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
