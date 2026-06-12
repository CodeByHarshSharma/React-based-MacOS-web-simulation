import React, { useEffect, useState } from 'react'

const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDateTime = (date) => {
  const dayName = Days[date.getDay()]
  const monthName = Months[date.getMonth()]
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  const formattedHour = String(hours % 12 || 12).padStart(2, '0')

  return `${dayName} ${monthName} ${day} ${formattedHour}:${minutes} ${period}`
}

const DateTime = () => {
  const [currentTime, setCurrentTime] = useState(() => formatDateTime(new Date()))

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return <p>{currentTime}</p>
}

export default DateTime
