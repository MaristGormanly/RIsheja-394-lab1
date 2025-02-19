import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/Calendar.css';
import { useAuth } from '../contexts/AuthContext';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [userProfile]);

  const fetchTasks = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/user/${userProfile.id}`, {
        headers: {
          'user-id': userProfile.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      
      // Convert tasks to calendar events
      const calendarEvents = tasks
        .filter(task => task.due_date) // Only include tasks with due dates
        .map(task => ({
          id: task.id,
          title: task.title,
          start: new Date(task.due_date),
          end: new Date(task.due_date),
          desc: task.description,
          status: task.status,
          priority: task.priority,
          isGoogleCalendarEvent: !!task.google_calendar_event_id,
        }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    // You can implement task details modal opening here
    console.log('Clicked event:', event);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        {error}
      </div>
    );
  }

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    // Style based on priority
    if (event.priority === 'HIGH') {
      backgroundColor = '#dc2626';
    } else if (event.priority === 'MEDIUM') {
      backgroundColor = '#f59e0b';
    } else if (event.priority === 'LOW') {
      backgroundColor = '#10b981';
    }

    // Style based on status
    if (event.status === 'COMPLETED') {
      backgroundColor = '#4b5563';
    }

    // Add Google Calendar indicator
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
    };

    if (event.isGoogleCalendarEvent) {
      style.borderLeft = '4px solid #4285f4';
    }

    return {
      style,
    };
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        tooltipAccessor={event => `${event.title}\n${event.desc || ''}\nPriority: ${event.priority}\nStatus: ${event.status}`}
      />
    </div>
  );
};

export default Calendar; 