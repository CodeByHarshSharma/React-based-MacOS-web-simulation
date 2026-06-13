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

            <a href={data.repoLink}>Repository</a>
            {data.demoLink && <a href={data.demoLink}>Demo Link</a>}
        </div>
    </div>
}


const Github = () => {
  return (
    <div>
      <MacWindow>
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