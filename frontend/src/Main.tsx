import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './styles/globals.css'

// The '!' asserts that the element will not be null
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)