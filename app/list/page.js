'use client'
import { useEffect, useState } from 'react';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await fetch('/api/recordings');
        const data = await res.json();
        setRecordings(data);
      } catch (error) {
        console.error('Failed to fetch recordings:', error);
      }
    };

    fetchRecordings();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Saved Recordings</h1>
      <ul className="space-y-2">
        {recordings.map((recording, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded">
            {recording.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recordings;
