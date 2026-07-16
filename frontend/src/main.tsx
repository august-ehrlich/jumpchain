import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => <h1>Vite is running in Docker with TypeScript!</h1>

// The '!' asserts that the element will not be null
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)