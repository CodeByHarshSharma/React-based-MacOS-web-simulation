import React from 'react'
import {Rnd} from 'react-rnd'
import './MacWindow.css'

const MacWindow = ({children}) => {
  return (
    <div>
      <Rnd default={{
        width: "55vw",
        height: "50vh",
        x: 200,
        y: 100
      }}>
        <div className="window">
            <div className="nav">
                <div className="dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
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
