import React from 'react'
import { Rnd } from 'react-rnd'
import './MacWindow.css'

const MacWindow = ({ children, height = "55vh", width = "55vw", maxWidth, maxHeight, windowName, setWindowState, bringWindowToFront, zIndex = 1 }) => {
  return (
    <div>
      <Rnd default={{
        width: width,
        height: height,
        x: 300,
        y: 0
      }}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        style={{ zIndex }} onMouseDown={() => bringWindowToFront(windowName)} onDragStart={() => bringWindowToFront(windowName)} onResizeStart={() => bringWindowToFront(windowName)}>
        <div className="window">
          <div className="nav">
            <div className="dots">
              <div onClick={() => setWindowState(state => ({ ...state, [windowName]: false }))} className="dot red"></div>
              <div onClick={() => setWindowState(state => ({ ...state, [windowName]: false }))} className="dot yellow"></div>
              <div className="dot green"></div>
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
