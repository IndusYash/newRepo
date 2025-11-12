import { useState } from 'react'
import aviationLogo from './assets/aviation-logo.svg' // Replace with your actual aviation logo
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [spottings, setSpottings] = useState(0)

  return (
    <>
      <div>
        <a href="https://your-aviation-bay-docs.com" target="_blank">
          <img src={aviationLogo} className="logo" alt="Aviation Bay logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Aviation Bay + React</h1>
      <div className="card">
        <button onClick={() => setSpottings((n) => n + 1)}>
          jets spotted: {spottings}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR and Aviation Bay!
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Aviation Bay and React logos to learn more
      </p>
    </>
  )
}

export default App
