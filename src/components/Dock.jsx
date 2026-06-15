import React from 'react'
import './Dock.css'

const Base = import.meta.env.BASE_URL
const Dock = ({openWindow}) => {
  return (
    <footer className='dock'>
        <div onClick={() => {openWindow('github')}} 
        className='icon github'><img src={Base + "/doc-icons/github.svg"} alt="" /></div>
        
        <div onClick={() => {openWindow('resume')}} className='icon pdf'><img src={Base + "/doc-icons/pdf.svg"} alt="" /></div>
        
        <div onClick={() => {window.open("mailto:mailittoharsh@gmail.com")}} className='icon mail'><img src={Base + "/doc-icons/mail.svg"} alt="" /></div>
        
        <div onClick={() => {window.open("https://www.linkedin.com/in/harsh-s-158244285/", "_blank")}} className='icon link'><img src={Base + "/doc-icons/link.svg"} alt="" /></div>
        
        <div onClick={() => {openWindow('note')}} className='icon note'><img src={Base + "/doc-icons/note.svg"} alt="" /></div>
        
        <div onClick={() => {openWindow('spotify')}} className='icon spotify'><img src={Base + "/doc-icons/spotify.svg"} alt="" /></div>
        
        <div onClick={() => {window.open("https://calendar.google.com/", "_blank")}} className='icon calender'><img src={Base + "/doc-icons/calender.svg"} alt="" /></div>
        
        <div onClick={() => {openWindow('cli')}} className='icon cli'><img src={Base + "/doc-icons/cli.svg"} alt="" /></div>
    </footer>
  )
}

export default Dock
