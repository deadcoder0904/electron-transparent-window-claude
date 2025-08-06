import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './styles/index.css'

const el = document.getElementById('root')
if (!el) {
  throw new Error('Root container #root not found in index.html')
}

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
