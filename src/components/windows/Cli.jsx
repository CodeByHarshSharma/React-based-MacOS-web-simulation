import React from 'react'
import MacWindow from './MacWindow'
import TerminalModule from 'react-console-emulator'
import './Cli.css'

const portfolioCommands = {
    whoami: {
        description: 'Quick intro about Harsh Sharma.',
        usage: 'whoami',
        fn: () => 'Harsh Sharma | MERN stack developer building interactive web apps.'
    },
    about: {
        description: 'Show a short portfolio summary.',
        usage: 'about',
        fn: () => 'This portfolio highlights frontend builds, creative UI work, problem-solving projects, and a few desktop-inspired interactions made with React.'
    },
    skills: {
        description: 'List the main tech stack.',
        usage: 'skills',
        fn: () => [
            'Frontend: JavaScript, React.js, TailwindCSS, GSAP.js',
            'Backend: Node.js, PostgreSQL, Express.js, Docker',
            'Tools: AWS, Git, Figma, Linux'
        ].join('\n')
    },
    projects: {
        description: 'Show featured portfolio projects.',
        usage: 'projects',
        fn: () => [
            'Featured work:',
            '1. Productivity Dashboard using DOM',
            '2. Premier Behance Clone',
            '3. Responsive Login & SignUp Page',
            '4. Super Image Resolution using GANs',
            '5. Frontend Mini Projects'
        ].join('\n')
    },
    resume: {
        description: 'Point to the resume section.',
        usage: 'resume',
        fn: () => 'Resume window is available on the desktop, and the PDF is served from /Harsh_Sharma_Resume.pdf.'
    },
    status: {
        description: 'Current availability.',
        usage: 'status',
        fn: () => 'Status: Open to Opportunities | Location: Hybrid | Focus: MERN-stack and frontend-heavy builds'
    },
    socials: {
        description: 'Show public profile links.',
        usage: 'socials',
        fn: () => [
            'GitHub: https://github.com/CodeByHarshSharma',
            'Portfolio windows: GitHub, Resume, Notes, Spotify, CLI'
        ].join('\n')
    },
    contact: {
        description: 'Show contact directions.',
        usage: 'contact',
        fn: () => 'Use the mail and link icons from the dock to reach out or open social links from the portfolio UI.'
    },
    echo: {
        description: 'Echo passed a string.',
        usage: 'echo <string>',
        fn: (...args) => args.join(' ')
    }
}

const welcomeMessage = [
    'Welcome to Harsh Sharma\'s portfolio terminal.',
    'Type any of the commands below to explore:',
    'whoami, about, skills, projects, resume, status, socials, contact, echo',
    'Built-in commands: help, clear'
]

const Cli = ({windowName, setWindowState, bringWindowToFront, zIndex}) => {
    return (
        <MacWindow
            windowName={windowName}
            setWindowState={setWindowState}
            bringWindowToFront={bringWindowToFront}
            zIndex={zIndex}
        >
            <div className="cli-window">
                <TerminalModule.default
                    commands={portfolioCommands}
                    welcomeMessage={welcomeMessage}
                    promptLabel={"harshsharma@hrs:~$"}
                    promptLabelStyle={{ color: "red" }}
                />
            </div>
        </MacWindow>
    )
}

export default Cli
