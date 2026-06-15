import React from 'react'
import GithubData from '../../assets/github.json'
import MacWindow from './MacWindow.jsx'
import './Github.css'

const GitCard = ({data = {id:1, image:"", title:"", description:"", tags:[], repoLink:"", demoLink:""}}) => {
    return <div className="card">
        <img src={data.image} alt="" />
        <h1>{data.title}</h1>
        <p className='desc'>{data.description}</p>
        <div className="tags">
            {
                data.tags.map(tag => <p className='tag'>{tag}</p>)
            }
        </div>

        <div className="urls">

            <a target='_blank' href={data.repoLink}>Repository</a>
            {data.demoLink && <a target='_blank'href={data.demoLink}>Demo Link</a>}
        </div>
    </div>
}

const Github = ({windowName, setWindowState, bringWindowToFront, zIndex}) => {
  return (
    <div>
      <MacWindow
        windowName={windowName}
        setWindowState={setWindowState}
        bringWindowToFront={bringWindowToFront}
        zIndex={zIndex}
      >
        <div className="cards">
            {GithubData.map(project => {
                return <GitCard data={project} />
            })}
        </div>
      </MacWindow>
    </div>
  )
}

export default Github
