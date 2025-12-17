import React, { useState } from 'react';
import axios from 'axios';

const AppointmentStatus = () => {
  const [visitorId, setVisitorId] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    try {
      const response = await axios.get(`/api/visitors/appointment/check/${visitorId}`);
      setAppointment(response.data.visitor);
      setError('');
    } catch (err) {
      setAppointment(null);
      setError('No appointment found for this ID.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Check Appointment Status</h2>

      <input
        type="text"
        className="border p-2 w-full mb-4 rounded"
        placeholder="Enter Visitor ID"
        value={visitorId}
        onChange={(e) => setVisitorId(e.target.value)}
      />

      <button
        onClick={handleCheck}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Check
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {appointment && (
        <div className="mt-6 border-t pt-4">
          <p><strong>Name:</strong> {appointment.name}</p>
          <p><strong>Email:</strong> {appointment.email}</p>
          <p><strong>Phone:</strong> {appointment.phone}</p>
          <p><strong>Visit Date:</strong> {appointment.visitDate}</p>
          <p><strong>Whom to Meet:</strong> {appointment.whomToMeet}</p>
          <p><strong>Purpose:</strong> {appointment.purpose}</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatus;
