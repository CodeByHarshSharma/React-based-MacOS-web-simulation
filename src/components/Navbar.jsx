import React from 'react'
import './Navbar.css'
import DateTime from './DateTime.jsx'

const Navbar = ({ openWindow }) => {
  return (
    <nav>
        <div className="left">
            <div className="apple-icon">
                <img src="./nav-icons/apple.svg" alt="Apple"/>
            </div>

            <div className="nav-item">
                <p>Harsh Sharma</p>
            </div>
            <div onClick={() => openWindow('resume')} className="nav-item">
                <p>File</p>
            </div>
            <div onClick={() => openWindow('github')} className="nav-item">
                <p>Window</p>
            </div>
            <div onClick={() => openWindow('cli')} className="nav-item">
                <p>Terminal</p>
            </div>

        </div>
        <div className="right">
            <div className="wifi-icon">
                <img src="./nav-icons/wifi.svg" alt="WiFi"/>
            </div>

            <div onClick={() => {window.open("https://calendar.google.com/", "_blank")}} className="nav-item">
                <DateTime  />
            </div>
        </div>
    </nav>
  )
}

export default Navbar
