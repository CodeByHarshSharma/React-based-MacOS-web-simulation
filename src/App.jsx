import React from 'react'
import Dock from './components/Dock.jsx'
import Navbar from './components/Navbar.jsx'
import Github from './components/windows/Github.jsx'
const App = () => {
  return (
      <main>
        <Navbar />
        <Github />
        <Dock />
      </main>
    
  )
}

export default App
