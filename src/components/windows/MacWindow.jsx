import React, { useState } from 'react'
import { Rnd } from 'react-rnd'
import './MacWindow.css'

const TOP_GAP = 0
const BOTTOM_GAP = 5

const MacWindow = ({ children, height = "55vh", width = "55vw", maxWidth, maxHeight, windowName, setWindowState, bringWindowToFront, zIndex = 1 }) => {
  const [layout, setLayout] = useState({ x: 300, y: 0, width, height })
  const [savedLayout, setSavedLayout] = useState(null)
  const isMaximized = savedLayout !== null

  const toggleMaximize = () => {
    if (isMaximized) {
      setLayout(savedLayout)
      setSavedLayout(null)
      return
    }
    const navBottom = document.querySelector('nav').getBoundingClientRect().bottom
    const dockTop = document.querySelector('.dock').getBoundingClientRect().top
    setSavedLayout(layout)
    setLayout({
      x: 0,
      y: TOP_GAP,
      width: window.innerWidth,
      height: dockTop - navBottom - TOP_GAP - BOTTOM_GAP,
    })
  }

  return (
    <div>
      <Rnd
        position={{ x: layout.x, y: layout.y }}
        size={{ width: layout.width, height: layout.height }}
        onDragStop={(e, d) => setLayout(current => ({ ...current, x: d.x, y: d.y }))}
        onResizeStop={(e, dir, ref, delta, pos) => setLayout({ x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight })}
        maxWidth={isMaximized ? undefined : maxWidth}
        maxHeight={isMaximized ? undefined : maxHeight}
        style={{ zIndex }}
        onMouseDown={() => bringWindowToFront(windowName)}
        onDragStart={() => bringWindowToFront(windowName)}
        onResizeStart={() => bringWindowToFront(windowName)}
      >
        <div className="window">
          <div className="nav">
            <div className="dots">
              <div onClick={() => setWindowState(state => ({ ...state, [windowName]: false }))} className="dot red"></div>
              <div onClick={() => setWindowState(state => ({ ...state, [windowName]: false }))} className="dot yellow"></div>
              <div onClick={toggleMaximize} className="dot green"></div>
            </div>
            <div className="title"><p>harshsharma - hrs</p></div>
          </div>
          <div className="main-content">
            {children}
          </div>
        </div>
      </Rnd>
    </div>
  )
}

export default MacWindow
