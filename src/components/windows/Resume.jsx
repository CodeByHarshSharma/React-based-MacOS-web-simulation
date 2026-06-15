import React from 'react'
import MacWindow from './MacWindow'
import './Resume.css'

const base = import.meta.env.BASE_URL;
const Resume = ({windowName, setWindowState, bringWindowToFront, zIndex}) => {
  return (
    <div>
      <MacWindow
        windowName={windowName}
        setWindowState={setWindowState}
        bringWindowToFront={bringWindowToFront}
        zIndex={zIndex}
      >
        <div className="resume-window">
            <embed src={base + "/Harsh_Sharma_Resume.pdf"} frameBorder='0'></embed>
        </div>
      </MacWindow>
    </div>
  )
}

export default Resume
