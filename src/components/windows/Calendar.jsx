import React, { useEffect, useMemo, useRef, useState } from 'react'
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
const formatLongDate = date => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)
const formatShortTime = value => {
  if (!value) return ''
  const [hour, minute] = value.split(':').map(Number)
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })
}
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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
  const [showComposer, setShowComposer] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('10:00')
  const [category, setCategory] = useState('personal')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const searchInputRef = useRef(null)
  const [view, setView] = useState('month')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch { /* storage can be unavailable */ }
  }, [events])

  useEffect(() => {
    const handleShortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') setShowComposer(false)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

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
  const selectedEvents = sortedEvents.filter(event => event.date === selectedDate)
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
  const openNewEvent = () => {
    setEditingId(null)
    setTitle('')
    setTime('10:00')
    setCategory('personal')
    setNotes('')
    setShowComposer(true)
  }
  const editEvent = event => {
    setEditingId(event.id)
    setSelectedDate(event.date)
    setTitle(event.title)
    setTime(event.time || '10:00')
    setCategory(event.category || 'personal')
    setNotes(event.notes || '')
    setShowComposer(true)
  }
  const saveEvent = event => {
    event.preventDefault()
    if (!title.trim()) return
    const record = { id: editingId || makeId(), date: selectedDate, title: title.trim(), time, category, notes: notes.trim() }
    setEvents(current => editingId ? current.map(item => item.id === editingId ? record : item) : [...current, record])
    const savedDate = fromKey(selectedDate)
    setVisibleMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1))
    setShowComposer(false)
  }
  const deleteEvent = id => setEvents(current => current.filter(event => event.id !== id))

  return (
    <MacWindow
      width="min(920px, 78vw)"
      height="min(660px, 78vh)"
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

          <button className="calendar-create" onClick={openNewEvent}><span>＋</span> New event</button>

          <div className="mini-calendar">
            <div className="mini-calendar-head">
              <strong>{MONTHS[visibleMonth.getMonth()].slice(0, 3)} {visibleMonth.getFullYear()}</strong>
              <div className="calendar-icon-actions">
                <button aria-label="Previous month" onClick={() => shiftMonth(-1)}>‹</button>
                <button aria-label="Next month" onClick={() => shiftMonth(1)}>›</button>
              </div>
            </div>
            <div className="mini-grid mini-weekdays">{WEEKDAYS.map(day => <span key={day}>{day[0]}</span>)}</div>
            <div className="mini-grid">
              {monthCells.map(cell => (
                <button key={cell.key} className={[`mini-day`, cell.outside ? 'is-outside' : '', cell.key === selectedDate ? 'is-selected' : '', cell.key === dateKey(today) ? 'is-today' : ''].join(' ')} onClick={() => setSelectedDate(cell.key)}>{cell.date.getDate()}</button>
              ))}
            </div>
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
              <label className="calendar-search"><span>⌕</span><input ref={searchInputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" />{query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}</label>
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
                {filteredEvents.filter(event => event.date.startsWith(\`${visibleMonth.getFullYear()}-${pad(visibleMonth.getMonth() + 1)}-\`)).map(event => <EventRow key={event.id} event={event} onEdit={editEvent} onDelete={deleteEvent} />)}
                {!filteredEvents.some(event => event.date.startsWith(`${visibleMonth.getFullYear()}-${pad(visibleMonth.getMonth() + 1)}-`)) && <div className="calendar-empty">Nothing planned this month.<br /><span>A little space can be a good thing.</span></div>}
              </div>
            </div>
          )}

          <footer className="calendar-bottom-bar">
            <div className="calendar-legend"><span><i className="work-dot"></i>Work</span><span><i className="personal-dot"></i>Personal</span><span><i className="focus-dot"></i>Focus</span></div>
            <span className="calendar-footer-hint"><kbd>⌘</kbd> + <kbd>K</kbd> Search is ready</span>
          </footer>
        </main>

        <aside className="calendar-inspector">
          <div className="inspector-topline"><span>DAY OVERVIEW</span><button aria-label="Close calendar" onClick={() => setWindowState(state => ({ ...state, [windowName]: false }))}>×</button></div>
          <div className="inspector-date"><span>{new Intl.DateTimeFormat('en', { weekday: 'short' }).format(selectedDateObject).toUpperCase()}</span><strong>{selectedDateObject.getDate()}</strong><p>{MONTHS[selectedDateObject.getMonth()]} {selectedDateObject.getFullYear()}</p></div>
          <div className="inspector-divider"></div>
          <div className="inspector-events-heading"><h3>Schedule</h3><span>{selectedEvents.length}</span></div>
          <div className="inspector-event-list">
            {selectedEvents.length ? selectedEvents.map(event => <EventRow key={event.id} event={event} onEdit={editEvent} onDelete={deleteEvent} compact />) : <div className="inspector-empty"><div className="empty-calendar-icon">◷</div><p>Clear skies.</p><span>Nothing on your schedule.</span><button onClick={openNewEvent}>Add something</button></div>}
          </div>
          <button className="inspector-add-button" onClick={openNewEvent}><span>＋</span> Add event</button>

          <div className="upcoming-section">
            <div className="upcoming-heading"><h3>Up next</h3><span>↗</span></div>
            {upcomingEvents.length ? upcomingEvents.map(event => <button key={event.id} className="upcoming-item" onClick={() => { setSelectedDate(event.date); setVisibleMonth(new Date(fromKey(event.date).getFullYear(), fromKey(event.date).getMonth(), 1)) }}><span className={`upcoming-color ${event.category || 'personal'}`}></span><span className="upcoming-copy"><strong>{event.title}</strong><small>{fromKey(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}{event.time ? ` · ${formatShortTime(event.time)}` : ''}</small></span><span className="upcoming-chevron">›</span></button>) : <p className="upcoming-none">Your next chapter is unwritten.</p>}
          </div>
        </aside>

        {showComposer && (
          <div className="calendar-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowComposer(false) }}>
            <form className="calendar-event-modal" onSubmit={saveEvent}>
              <div className="event-modal-header"><div><p>{editingId ? 'EDIT EVENT' : 'NEW EVENT'}</p><h2>{editingId ? 'A small adjustment' : 'Make a plan'}</h2></div><button type="button" onClick={() => setShowComposer(false)} aria-label="Close event form">×</button></div>
              <label className="event-field event-title-field"><span>Title</span><input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="What are you planning?" required maxLength={80} /></label>
              <div className="event-field-row">
                <label className="event-field"><span>Date</span><input type="date" value={selectedDate} onChange={event => { if (event.target.value) { setSelectedDate(event.target.value); const date = fromKey(event.target.value); setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1)) } }} required /></label>
                <label className="event-field"><span>Time</span><input type="time" value={time} onChange={event => setTime(event.target.value)} /></label>
              </div>
              <fieldset className="event-category-field"><legend>Calendar</legend><div className="event-category-options">
                {['work', 'personal', 'focus'].map(item => <button type="button" key={item} className={category === item ? `chosen ${item}` : item} onClick={() => setCategory(item)}><i className={`${item}-dot`}></i>{item === 'work' ? 'Work' : item === 'focus' ? 'Focus time' : 'Personal'}</button>)}
              </div></fieldset>
              <label className="event-field event-notes-field"><span>Notes <small>Optional</small></span><textarea value={notes} onChange={event => setNotes(event.target.value)} rows="3" placeholder="Add a little context…" maxLength={300} /></label>
              <div className="event-modal-actions"><button type="button" className="event-cancel" onClick={() => setShowComposer(false)}>Cancel</button><button type="submit" className="event-save">{editingId ? 'Save changes' : 'Create event'}</button></div>
            </form>
          </div>
        )}
      </section>
    </MacWindow>
  )
}

const EventRow = ({ event, onEdit, onDelete, compact = false }) => (
  <div className={`calendar-event-row ${compact ? 'compact' : ''}`}>
    <span className={`event-row-marker ${event.category || 'personal'}`}></span>
    <button className="event-row-content" onClick={() => onEdit(event)}>
      <strong>{event.title}</strong>
      <span>{event.time ? formatShortTime(event.time) : 'Any time'}{!compact && event.date ? ` · ${fromKey(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}</span>
      {compact && event.notes && <small>{event.notes}</small>}
    </button>
    <div className="event-row-actions"><button title="Edit event" aria-label={`Edit ${event.title}`} onClick={() => onEdit(event)}>✎</button><button title="Delete event" aria-label={`Delete ${event.title}`} onClick={() => onDelete(event.id)}>×</button></div>
  </div>
)

export default Calendar
