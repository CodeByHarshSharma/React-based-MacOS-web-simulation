import React, { useState } from 'react'
import Dock from './components/Dock.jsx'
import Navbar from './components/Navbar.jsx'
import Github from './components/windows/Github.jsx'
import Note from './components/windows/Note.jsx'
import Resume from './components/windows/Resume.jsx'
import Spotify from './components/windows/Spotify.jsx'
import Calendar from './components/windows/Calendar.jsx'
import Cli from './components/windows/Cli.jsx'
import Hero from './components/Hero.jsx'

const windowNames = ['github', 'resume', 'note', 'spotify', 'calendar', 'cli']

const App = () => {
  const [windowState, setWindowState] = useState({
    github: false,
    note: false,
    resume: false,
    spotify: false,
    calendar: false,
    cli: false
  })

  const [windowOrder, setWindowOrder] = useState(windowNames)

  const bringWindowToFront = (windowName) => {
    setWindowOrder((currentOrder) => [...currentOrder.filter((name) => name !== windowName), windowName])
  }

  const openWindow = (windowName) => {
    setWindowState((state) => ({ ...state, [windowName]: true }))
    bringWindowToFront(windowName)
  }

  const getWindowZIndex = (windowName) => windowOrder.indexOf(windowName) + 1

  return (
    <main>
      <Navbar openWindow={openWindow} />
      {windowState.github && (
        <Github
          windowName="github"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('github')}
        />
      )}
      {windowState.resume && (
        <Resume
          windowName="resume"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('resume')}
        />
      )}
      {windowState.note && (
        <Note
          windowName="note"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('note')}
        />
      )}
      {windowState.spotify && (
        <Spotify
          windowName="spotify"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('spotify')}
        />
      )}
      {windowState.calendar && (
        <Calendar
          windowName="calendar"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('calendar')}
        />
      )}
      {windowState.cli && (
        <Cli
          windowName="cli"
          setWindowState={setWindowState}
          bringWindowToFront={bringWindowToFront}
          zIndex={getWindowZIndex('cli')}
        />
      )}
      <Hero />
      <Dock openWindow={openWindow} />
    </main>

  )
}

export default App
