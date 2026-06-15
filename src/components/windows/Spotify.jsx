import React from 'react'
import MacWindow from './MacWindow'
import './Spotify.css'

const Spotify = ({windowName, setWindowState, bringWindowToFront, zIndex}) => {
  return (
    <MacWindow
      width="40vw"
      height="55vh"
      windowName={windowName}
      setWindowState={setWindowState}
      bringWindowToFront={bringWindowToFront}
      zIndex={zIndex}
    >
        <div className="spotify-window">
            <iframe
              data-testid="embed-iframe"
              title="Spotify playlist"
              src="https://open.spotify.com/embed/playlist/37i9dQZEVXbMWDif5SCBJq?utm_source=generator&theme=0&si=a624d85f8b954dac"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
        </div>
    </MacWindow>
  )
}

export default Spotify
