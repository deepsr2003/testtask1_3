import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    const { data } = await axios.get('http://localhost:3001/events');
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 text-sm">
      <h1 className="text-xl font-bold mb-4">Google Calendar Events</h1>
      <a href="http://localhost:3001/auth" className="text-blue-500 underline">Login with Google</a>
      <ul className="mt-4">
        {events.map((event) => (
          <li key={event.id} className="mb-2">
            <b>{event.summary}</b> <br />
            {event.start?.dateTime || event.start?.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
