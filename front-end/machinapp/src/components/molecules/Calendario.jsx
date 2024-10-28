import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { axiosCliente } from "../../index";

export const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [calendarApi, setCalendarApi] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosCliente.get('/actividades/listar');
        const data = response.data; 
  
        if (data.resultadoActividad) {
          const mappedEvents = data.resultadoActividad.map(event => ({
            title: event.acti_nombre, 
            start: event.acti_fecha_realizacion,
          }));
          setEvents(mappedEvents);
        } else {
          console.error(data);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchEvents();
  }, []); 

  const handleDateClick = (info) => {
    if (calendarApi) {
      calendarApi.changeView('listDay', info.dateStr);
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height={750}
        headerToolbar={{
          start: '', 
          center: 'title',
          end: 'today dayGridMonth prev,next'
        }}
        timeZone='local'
        events={events}
        dateClick={handleDateClick}
        ref={(calendarRef) => {
          if (calendarRef) {
            setCalendarApi(calendarRef.getApi());
          }
        }}
        dayMaxEvents={1} 
        moreLinkClick="popover" 
      />
    </div>
  );
};
