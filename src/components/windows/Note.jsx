import React, {useEffect, useState} from 'react'
import Markdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import {atelierDuneDark} from 'react-syntax-highlighter/dist/esm/styles/hljs'
import MacWindow from './MacWindow';
import './Note.css'

const base = import.meta.env.BASE_URL;
const  Note = ({windowName, setWindowState, bringWindowToFront, zIndex}) => {

    const [markdown, setMarkdown] = useState(null);

    useEffect(() => {
        fetch(base + "/note.txt")
            .then(res => res.text())
            .then(text => setMarkdown(text))
    },[])
  return (
    <div>
      <MacWindow
        windowName={windowName}
        setWindowState={setWindowState}
        bringWindowToFront={bringWindowToFront}
        zIndex={zIndex}
      >
        <div className="note-window">
            {markdown ? <SyntaxHighlighter language='typescript' style={atelierDuneDark}>{markdown}</SyntaxHighlighter> : <p>Loading...</p>}
        </div>
      </MacWindow>
    </div>
  )
}

export default  Note
