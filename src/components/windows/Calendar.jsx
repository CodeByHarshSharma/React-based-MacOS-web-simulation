import React, { useEffect, useMemo, useState } from 'react'
import MacWindow from './MacWindow'
import './Calendar.css'

const STORAGE_KEY = 'arcos-calendar-events-v1'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = value => String(value).padStart(2, '0')
const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const fromKey = key => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const formatShortTime = value => {
  if (!value) return ''
  const [hour, minute] = value.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
}

const starterEvents = () => {
  const now = new Date()
  const today = dateKey(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 3)
  return [
    { id: 'starter-1', date: today, title: 'A little planning', time: '10:30', category: 'personal', notes: 'Make room for the things that matter.' },
    { id: 'starter-2', date: dateKey(tomorrow), title: 'Project focus time', time: '16:00', category: 'work', notes: 'One task at a time.' },
    { id: 'starter-3', date: dateKey(nextWeek), title: 'Build something cool', time: '18:30', category: 'personal', notes: 'A small step still counts.' }
  ]
}

const readEvents = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : starterEvents()
  } catch {
    return starterEvents()
  }
}

const Calendar = ({ windowName, setWindowState, bringWindowToFront, zIndex }) => {
  const today = useMemo(() => new Date(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today))
  const [events, setEvents] = useState(readEvents)
  const [query, setQuery] = useState('')
  const [view, setView] = useState('month')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch { /* storage can be unavailable */ }
  }, [events])


  const monthCells = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevious = new Date(year, month, 0).getDate()
    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - firstWeekday + 1
      let date
      let outside = false
      if (dayNumber < 1) {
        date = new Date(year, month - 1, daysInPrevious + dayNumber)
        outside = true
      } else if (dayNumber > daysInMonth) {
        date = new Date(year, month + 1, dayNumber - daysInMonth)
        outside = true
      } else {
        date = new Date(year, month, dayNumber)
      }
      return { key: dateKey(date), date, outside }
    })
  }, [visibleMonth])

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')), [events])
  const filteredEvents = sortedEvents.filter(event => {
    const search = query.trim().toLowerCase()
    return !search || event.title.toLowerCase().includes(search) || (event.notes || '').toLowerCase().includes(search)
  })
  const monthEvents = sortedEvents.filter(event => event.date.startsWith(`${visibleMonth.getFullYear()}-${pad(visibleMonth.getMonth() + 1)}-`))
  const upcomingEvents = sortedEvents.filter(event => event.date >= dateKey(today)).slice(0, 4)
  const selectedDateObject = fromKey(selectedDate)

  const shiftMonth = amount => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  const goToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(dateKey(today))
  }

  return (
    <MacWindow
      width="72vw"
      height="78vh"
      maxWidth={850}
      maxHeight={650}
      windowName={windowName}
      setWindowState={setWindowState}
      bringWindowToFront={bringWindowToFront}
      zIndex={zIndex}
    >
      <section className="arcos-calendar">
        <aside className="calendar-sidebar">
          <div className="calendar-brand">
            <div className="calendar-app-icon"><span></span><span></span><span></span><span></span></div>
            <div><p className="calendar-eyebrow">ARCOS APP</p><h2>Calendar</h2></div>
          </div>


          <div className="calendar-side-section">
            <p className="calendar-section-label">MY CALENDARS</p>
            <div className="calendar-filter"><span className="category-dot work-dot"></span><span>Work</span><span className="calendar-check">✓</span></div>
            <div className="calendar-filter"><span className="category-dot personal-dot"></span><span>Personal</span><span className="calendar-check">✓</span></div>
            <div className="calendar-filter"><span className="category-dot focus-dot"></span><span>Focus time</span><span className="calendar-check">✓</span></div>
          </div>

          <div className="calendar-sidebar-bottom">
            <div className="calendar-profile"><div className="calendar-avatar">H</div><div><strong>Harsh</strong><span>On this Mac</span></div><span className="profile-menu">···</span></div>
          </div>
        </aside>

        <main className="calendar-main">
          <header className="calendar-toolbar">
            <div className="calendar-toolbar-left">
              <button className="calendar-today-button" onClick={goToday}>Today</button>
              <div className="calendar-icon-actions large-actions">
                <button aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
                <button aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
              </div>
              <div className="calendar-heading"><h1>{MONTHS[visibleMonth.getMonth()]} <span>{visibleMonth.getFullYear()}</span></h1><p>{monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'} this month</p></div>
            </div>
            <div className="calendar-toolbar-right">
              <label className="calendar-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" />{query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>
              <div className="calendar-view-switch" role="group" aria-label="Calendar view">
                <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
                <button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}>Agenda</button>
              </div>
            </div>
          </header>

          {view === 'month' ? (
            <div className="calendar-month-view">
              <div className="calendar-weekday-row">{WEEKDAYS.map(day => <div key={day}>{day}</div>)}</div>
              <div className="calendar-month-grid">
                {monthCells.map(cell => {
                  const dayEvents = (query ? filteredEvents : sortedEvents).filter(event => event.date === cell.key)
                  return (
                    <button key={cell.key} className={[`calendar-day-cell`, cell.outside ? 'outside-month' : '', cell.key === selectedDate ? 'selected-day' : '', cell.key === dateKey(today) ? 'today-cell' : ''].join(' ')} onClick={() => setSelectedDate(cell.key)}>
                      <span className="calendar-day-number">{cell.date.getDate()}</span>
                      <span className="calendar-day-events">
                        {dayEvents.slice(0, 3).map(event => <span className={`calendar-event-chip ${event.category || 'personal'}`} key={event.id}><i></i>{event.title}</span>)}
                        {dayEvents.length > 3 && <span className="calendar-more-events">+{dayEvents.length - 3} more</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="calendar-agenda-view">
              <div className="agenda-view-title"><span className="agenda-date-block"><strong>{pad(selectedDateObject.getDate())}</strong><span>{MONTHS[selectedDateObject.getMonth()].slice(0, 3)}</span></span><div><h2>Agenda</h2><p>Everything you have planned</p></div></div>
              <div className="agenda-list">
                {filteredEvents.filter(event => event.date.startsWith(`${visibleMonth.getFullYear()}-${pad(visibleMonth.getMonth() + 1)}-`)).map(event => <EventRow key={event.id} event={event} />)}
                {!filteredEvents.some(event => event.date.startsWith(`${visibleMonth.getFullYear()}-${pad(visibleMonth.getMonth() + 1)}-`)) && <div className="calendar-empty">Nothing planned this month.<br /><span>A little space can be a good thing.</span></div>}
              </div>
            </div>
          )}

          <footer className="calendar-bottom-bar">
            <div className="calendar-legend"><span><i className="work-dot"></i>Work</span><span><i className="personal-dot"></i>Personal</span><span><i className="focus-dot"></i>Focus</span></div>
          </footer>
        </main>


      </section>
    </MacWindow>
  )
}

const EventRow = ({ event, compact = false }) => (
  <div className={`calendar-event-row ${compact ? 'compact' : ''}`}>
    <span className={`event-row-marker ${event.category || 'personal'}`}></span>
    <div className="event-row-content">
      <strong>{event.title}</strong>
      <span>
        {event.time ? formatShortTime(event.time) : 'Any time'}
        {!compact && event.date
          ? ` · ${fromKey(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
          : ''}
      </span>
      {compact && event.notes && <small>{event.notes}</small>}
    </div>
  </div>
)

export default Calendar