import React from 'react'
import './Dock.css'

const Dock = ({openWindow}) => {
  return (
    <footer className='dock'>
        <div onClick={() => {openWindow('github')}} 
        className='icon github'><img src="/doc-icons/github.svg" alt="" /></div>
        
        <div onClick={() => {openWindow('resume')}} className='icon pdf'><img src="/doc-icons/pdf.svg" alt="" /></div>
        
        <div onClick={() => {window.open("mailto:mailittoharsh@gmail.com")}} className='icon mail'><img src="/doc-icons/mail.svg" alt="" /></div>
        
        <div onClick={() => {window.open("https://www.linkedin.com/in/harsh-s-158244285/", "_blank")}} className='icon link'><img src="/doc-icons/link.svg" alt="" /></div>
        
        <div onClick={() => {openWindow('note')}} className='icon note'><img src="/doc-icons/note.svg" alt="" /></div>
        
        <div onClick={() => {openWindow('spotify')}} className='icon spotify'><img src="/doc-icons/spotify.svg" alt="" /></div>
        
        <div onClick={() => {window.open("https://calendar.google.com/", "_blank")}} className='icon calender'><img src="/doc-icons/calender.svg" alt="" /></div>
        
        <div onClick={() => {openWindow('cli')}} className='icon cli'><img src="/doc-icons/cli.svg" alt="" /></div>
    </footer>
  )
}

export default Dock
